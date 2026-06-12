import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import { Sidebar, ROLES } from './components/Sidebar';
import type { Role } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { KickoffPage } from './pages/KickoffPage';
import { ComingSoon } from './pages/ComingSoon';
import { ConfigPage } from './pages/ConfigPage';
import { SugestoesPage } from './pages/SugestoesPage';
import { DocumentacaoPage } from './pages/Documentacao';
import { ProjetosPage } from './pages/Projetos';
import { ProjectOverview } from './pages/Projetos/ProjectOverview';
import { NewKickoffModal } from './components/NewKickoffModal';
import { ProjectPickerModal } from './components/ProjectPickerModal';
import { IntroScreen } from './components/IntroScreen';
import type { NexusProject } from './lib/projectStore';
import { loadProject } from './lib/projectStore';

type Page = 'kickoff' | 'projetos' | 'overview' | 'ferramentas' | 'dashboard' | 'config' | 'sugestoes' | 'documentacao';

const PAGE_TITLES: Record<Page, string> = {
  kickoff:       'Kickoff',
  projetos:      'Projetos',
  overview:      'Projeto',
  ferramentas:   'Ferramentas I.A',
  dashboard:     'Dashboard',
  config:        'Configurações',
  sugestoes:     'Sugestões',
  documentacao:  'Documentação',
};

const SESSION_KEY = 'nexus_session';

function loadSession(): { name: string; role: Role } | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); }
  catch { return null; }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadSession() !== null);
  const [userName, setUserName] = useState(() => loadSession()?.name ?? '');
  const [showIntro, setShowIntro] = useState(false);
  const [page, setPage] = useState<Page>('projetos');
  const [role, setRole] = useState<Role>(() => loadSession()?.role ?? 'gestao');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newKickoffOpen, setNewKickoffOpen] = useState(false);
  const [projetosRefreshKey, setProjetosRefreshKey] = useState(0);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeProject = useMemo(() => activeProjectId ? loadProject(activeProjectId) : null, [activeProjectId, projetosRefreshKey]);

  const handleOpenProject = (project: NexusProject) => {
    setActiveProjectId(project.id);
    setPage('overview');
  };

  const handleOpenKickoff = (projectId: string) => {
    setActiveProjectId(projectId);
    setPage('kickoff');
  };

  const handleNewKickoffCreated = (project: NexusProject) => {
    setActiveProjectId(project.id);
    setPage('kickoff');
    setNewKickoffOpen(false);
    setProjetosRefreshKey(k => k + 1);
  };

  const handleNavigate = (p: Page) => {
    setIsFullscreen(false);
    if (p === 'kickoff') {
      setActiveProjectId(null);
    } else if (p !== 'overview') {
      setActiveProjectId(null);
    }
    setPage(p);
  };

  const roleLabel = ROLES.find(r => r.value === role)?.label ?? role;

  // mantém a sessão persistida em sincronia ao trocar o papel pela sidebar
  const handleRoleChange = (r: Role) => {
    setRole(r);
    const session = loadSession();
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, role: r }));
  };

  function renderKickoffLanding() {
    return (
      <Box
        className="page-enter"
        sx={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100%', p: 4,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 380 }}>
          <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'monospace', mb: '8px', letterSpacing: '1px' }}>
            NEXUS · KICKOFF WCS
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'text.primary', letterSpacing: '-.4px', mb: '6px' }}>
            Kickoff
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3.5, lineHeight: 1.6 }}>
            Abra um projeto existente para continuar preenchendo ou crie um novo kickoff do zero.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddRoundedIcon />}
              onClick={() => setNewKickoffOpen(true)}
              sx={{ fontWeight: 800, fontSize: 14, py: 1.25 }}
            >
              Novo Kickoff
            </Button>

            <Paper
              elevation={0}
              component="button"
              onClick={() => setProjectPickerOpen(true)}
              sx={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                p: '10px 20px', bgcolor: 'transparent', border: '1px solid', borderColor: 'divider',
                cursor: 'pointer', borderRadius: 1.5,
                color: 'text.secondary', fontSize: 13, fontWeight: 600,
                transition: '.15s',
                '&:hover': { borderColor: 'rgba(255,197,0,0.35)', color: 'text.primary', bgcolor: 'rgba(255,197,0,0.03)' },
              }}
            >
              <FolderOpenRoundedIcon sx={{ fontSize: 18 }} />
              Abrir projeto existente
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  }

  function renderPage() {
    switch (page) {
      case 'kickoff':
        if (!activeProjectId) return renderKickoffLanding();
        return (
          <KickoffPage
            onNavigate={handleNavigate}
            projectId={activeProjectId}
            onProjectSaved={(id: string) => { setActiveProjectId(id); setProjetosRefreshKey(k => k + 1); }}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(f => !f)}
          />
        );
      case 'overview':
        return (
          <ProjectOverview
            projectId={activeProjectId}
            onOpenKickoff={handleOpenKickoff}
            onBack={() => setPage('projetos')}
            onUpdate={() => setProjetosRefreshKey(k => k + 1)}
          />
        );
      case 'projetos':
        return (
          <ProjetosPage
            onOpenProject={handleOpenProject}
            onOpenKickoff={handleOpenKickoff}
            onNewKickoff={() => setNewKickoffOpen(true)}
            refreshKey={projetosRefreshKey}
          />
        );
      case 'ferramentas':
        return <ComingSoon iconType="config" title="Ferramentas I.A" description="Automações, assistente de kickoff, geração de documentos com I.A e muito mais em breve." />;
      case 'dashboard':
        return <ComingSoon iconType="dashboard" title="Dashboard" description="Métricas e indicadores dos projetos: taxa de preenchimento, seções críticas, timeline." />;
      case 'config':
        return <ConfigPage role={role} />;
      case 'sugestoes':
        return <SugestoesPage role={role} userName={userName} />;
      case 'documentacao':
        return <DocumentacaoPage />;
    }
  }

  const inKickoffFullscreen = isFullscreen && page === 'kickoff' && !!activeProjectId;

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setUserName('');
    setRole('gestao');
    setShowIntro(false);
    setPage('projetos');
    setActiveProjectId(null);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={(nome, r) => {
          setUserName(nome);
          setRole(r);
          setIsAuthenticated(true);
          setShowIntro(true);
          localStorage.setItem(SESSION_KEY, JSON.stringify({ name: nome, role: r }));
        }}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}

      {!inKickoffFullscreen && (
        <Sidebar current={page as 'kickoff' | 'projetos' | 'ferramentas' | 'dashboard' | 'config'} onNavigate={handleNavigate} role={role} onRoleChange={handleRoleChange} userName={userName} onLogout={handleLogout} />
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header — hidden in kickoff fullscreen */}
        {!inKickoffFullscreen && (
          <Box
            component="header"
            sx={{
              height: 52,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              px: 3,
              flexShrink: 0,
              bgcolor: '#111111',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11, flexShrink: 0 }}>
                NEXUS
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11, flexShrink: 0 }}>›</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: (page === 'kickoff' || page === 'overview') && activeProject ? 'text.secondary' : 'text.primary', flexShrink: 0 }}>
                {(page === 'kickoff' || page === 'overview') && activeProject ? 'Projeto' : PAGE_TITLES[page]}
              </Typography>
              {(page === 'kickoff' || page === 'overview') && activeProject && (
                <>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11, flexShrink: 0 }}>›</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeProject.answers?.g_codinome || activeProject.name || activeProject.client}
                  </Typography>
                </>
              )}
            </Box>

            {page === 'kickoff' && activeProjectId && (
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  size="small"
                  label={roleLabel}
                  variant="outlined"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'rgba(255,197,0,0.08)',
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Page content */}
        <Box
          component="main"
          key={page + (activeProjectId ?? '')}
          className="page-enter"
          sx={{ flex: 1, overflow: page === 'kickoff' && activeProjectId ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}
        >
          {renderPage()}
        </Box>
      </Box>

      <NewKickoffModal
        open={newKickoffOpen}
        onClose={() => setNewKickoffOpen(false)}
        onCreate={handleNewKickoffCreated}
      />

      <ProjectPickerModal
        open={projectPickerOpen}
        onClose={() => setProjectPickerOpen(false)}
        onSelect={p => handleOpenKickoff(p.id)}
      />
    </Box>
  );
}
