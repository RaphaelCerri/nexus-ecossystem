import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import type { NexusProject, Contact, Pendencia, JsonVersion } from '../../lib/projectStore';
import { loadProject, upsertProject, getProgress, generateId } from '../../lib/projectStore';
import { generateDocx } from '../../lib/docxBuilder';
import type { InputJson, UserInfo } from '../../lib/docxBuilder';
import { SECTION_MAP } from '../../lib/sectionMeta';

function getADefinirBySection(answers: Record<string, string>) {
  const counts: Record<string, number> = {};
  Object.entries(answers).forEach(([key, val]) => {
    if (!val) return;
    const isTbd = val === 'tbd';
    const hasDefinir = !isTbd && /definir/i.test(val);
    if (!isTbd && !hasDefinir) return;
    let secId = 'ge';
    if (key.startsWith('os')) secId = 'os';
    else if (key.startsWith('p') && !key.startsWith('pt') && !key.startsWith('pk')) secId = 'pb';
    else if (key.startsWith('ct') || key === 's1c' || key === 's2c') secId = 'ct';
    else if (key.startsWith('fc')) secId = 'fc';
    else if (key.startsWith('es')) secId = 'es';
    else if (key.startsWith('st') || key.startsWith('so')) secId = 'so';
    else if (key.startsWith('cf')) secId = 'cf';
    else if (key.startsWith('pk')) secId = 'pk';
    else if (key.startsWith('pt')) secId = 'pt';
    else if (key.startsWith('et')) secId = 'et';
    else if (key.startsWith('in')) secId = 'in';
    else if (key.startsWith('if')) secId = 'if';
    else if (key.startsWith('l')) secId = 'la';
    else if (key.startsWith('c') && !key.startsWith('ct') && !key.startsWith('cf')) secId = 'cu';
    else if (key.startsWith('g')) secId = 'ge';
    counts[secId] = (counts[secId] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([id, count]) => ({ sectionId: id, sectionName: SECTION_MAP[id] || id, count }))
    .sort((a, b) => b.count - a.count);
}

interface Props {
  projectId: string | null;
  onOpenKickoff: (projectId: string) => void;
  onBack: () => void;
  onUpdate: () => void;
}

interface ContactDialogState {
  open: boolean;
  editing: Contact | null;
  titulo: string;
  email: string;
  phone: string;
}

function phoneMask(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function phoneDigits(v: string): string { return v.replace(/\D/g, ''); }
function phoneValid(v: string): boolean { const d = phoneDigits(v); return d.length === 10 || d.length === 11; }

function getCurrentUser(): UserInfo | undefined {
  try {
    const session = JSON.parse(localStorage.getItem('nexus_session') ?? 'null') as { name: string } | null;
    if (!session?.name) return undefined;
    const users = JSON.parse(localStorage.getItem('nexus_users') ?? '{}') as Record<string, { name: string }>;
    const match = Object.entries(users).find(([, u]) => u.name === session.name);
    return { name: session.name, email: match ? match[0] : '' };
  } catch { return undefined; }
}

function getCurrentRole(): string {
  try {
    const session = JSON.parse(localStorage.getItem('nexus_session') ?? 'null') as { role?: string } | null;
    return session?.role ?? '';
  } catch { return ''; }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  });
}

export function ProjectOverview({ projectId, onOpenKickoff, onBack, onUpdate }: Props) {
  const [project, setProject] = useState<NexusProject | null>(null);
  const [contactDialog, setContactDialog] = useState<ContactDialogState>({
    open: false, editing: null, titulo: '', email: '', phone: '',
  });
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [deleteTask, setDeleteTask] = useState<Pendencia | null>(null);
  const [editTask, setEditTask] = useState<Pendencia | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [aDefNoteEditing, setADefNoteEditing] = useState<string | null>(null);
  const [aDefNoteValue, setADefNoteValue] = useState('');
  const [jsonAccordionOpen, setJsonAccordionOpen] = useState(false);
  const [deleteVersion, setDeleteVersion] = useState<JsonVersion | null>(null);
  const [generatingVersion, setGeneratingVersion] = useState<string | null>(null);
  const [genVersionError, setGenVersionError] = useState<string | null>(null);
  const [spUrl, setSpUrl] = useState('');
  const currentRole = getCurrentRole();

  useEffect(() => {
    if (!projectId) return;
    const p = loadProject(projectId);
    setProject(p);
    setSpUrl(p?.sharePointUrl ?? '');
  }, [projectId]);

  if (!project) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack} color="inherit" size="small">
          Voltar
        </Button>
        <Typography sx={{ color: 'text.disabled' }}>Projeto não encontrado.</Typography>
      </Box>
    );
  }

  const progress = getProgress(project);
  const progColor = progress === 100 ? '#22c55e' : progress > 0 ? '#ffc500' : '#666';
  const date = new Date(project.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  const aDefinirCount = Object.values(project.answers).filter(v => v === 'tbd').length;
  const contacts = project.contacts ?? [];

  // Display the project code from kickoff answers (g2) if available, else internal code
  const displayCode = project.answers?.g2 || project.code;

  const handleCopyEmail = (c: Contact) => {
    const text = c.titulo ? `${c.titulo} <${c.email}>` : c.email;
    copyText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllEmails = () => {
    const emailsWithNames = contacts
      .filter(c => c.email)
      .map(c => c.titulo ? `${c.titulo} <${c.email}>` : c.email)
      .join('; ');
    copyText(emailsWithNames);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const saveProject = (updated: NexusProject) => {
    upsertProject({ ...updated, updatedAt: new Date().toISOString() });
    setProject({ ...updated, updatedAt: new Date().toISOString() });
    onUpdate();
  };

  const openAddContact = () => setContactDialog({ open: true, editing: null, titulo: '', email: '', phone: '' });
  const openEditContact = (c: Contact) => setContactDialog({ open: true, editing: c, titulo: c.titulo, email: c.email, phone: phoneMask(c.phone ?? '') });
  const closeContactDialog = () => setContactDialog({ open: false, editing: null, titulo: '', email: '', phone: '' });

  const saveContact = () => {
    const { titulo, email, phone, editing } = contactDialog;
    if (!titulo.trim() && !email.trim()) return;
    if (phone && !phoneValid(phone)) return;
    const rawPhone = phoneDigits(phone);
    const current = project.contacts ?? [];
    let updated: Contact[];
    const fields = { titulo: titulo.trim(), email: email.trim(), phone: rawPhone || undefined };
    if (editing) {
      updated = current.map(c => c.id === editing.id ? { ...c, ...fields } : c);
    } else {
      updated = [...current, { id: generateId(), ...fields }];
    }
    saveProject({ ...project, contacts: updated });
    closeContactDialog();
  };

  const confirmDeleteContact = () => {
    if (!deleteContact) return;
    const updated = (project.contacts ?? []).filter(c => c.id !== deleteContact.id);
    saveProject({ ...project, contacts: updated });
    setDeleteContact(null);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const entry: Pendencia = { id: generateId(), titulo: newTaskTitle.trim(), feito: false };
    if (newTaskDesc.trim()) entry.descricao = newTaskDesc.trim();
    saveProject({ ...project, pendencias: [...(project.pendencias ?? []), entry] });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setAddingTask(false);
  };

  const toggleTask = (id: string) => {
    const updated = (project.pendencias ?? []).map(t => t.id === id ? { ...t, feito: !t.feito } : t);
    saveProject({ ...project, pendencias: updated });
  };

  const confirmDeleteTask = () => {
    if (!deleteTask) return;
    const updated = (project.pendencias ?? []).filter(t => t.id !== deleteTask.id);
    saveProject({ ...project, pendencias: updated });
    setDeleteTask(null);
  };

  const openEditTask = (t: Pendencia) => {
    setEditTask(t);
    setEditTaskTitle(t.titulo);
    setEditTaskDesc(t.descricao ?? '');
  };

  const saveEditTask = () => {
    if (!editTask || !editTaskTitle.trim()) return;
    const updated = (project.pendencias ?? []).map(t =>
      t.id === editTask.id
        ? { ...t, titulo: editTaskTitle.trim(), descricao: editTaskDesc.trim() || undefined }
        : t
    );
    saveProject({ ...project, pendencias: updated });
    setEditTask(null);
  };

  const downloadVersion = (v: JsonVersion) => {
    const blob = new Blob([v.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = v.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateFromVersion = async (v: JsonVersion) => {
    setGeneratingVersion(v.id);
    setGenVersionError(null);
    try {
      const resp = await fetch('/ES_PLACEHOLDER_v7.docx', { cache: 'no-store' });
      if (!resp.ok) throw new Error('Template não encontrado.');
      const templateBytes = await resp.arrayBuffer();
      const inputJson = JSON.parse(v.content) as InputJson;
      const result = await generateDocx(templateBytes, inputJson, getCurrentUser());
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setGenVersionError(err instanceof Error ? err.message : 'Erro ao gerar documento.');
    } finally {
      setGeneratingVersion(null);
    }
  };

  const confirmDeleteVersion = () => {
    if (!deleteVersion) return;
    const updated = (project.jsonVersions ?? []).filter(v => v.id !== deleteVersion.id);
    saveProject({ ...project, jsonVersions: updated });
    setDeleteVersion(null);
  };

  const saveADefNote = (sectionId: string) => {
    const notes = { ...(project.aDefinirNotes ?? {}), [sectionId]: aDefNoteValue.trim() };
    if (!aDefNoteValue.trim()) delete notes[sectionId];
    saveProject({ ...project, aDefinirNotes: notes });
    setADefNoteEditing(null);
  };

  const aDefs = getADefinirBySection(project.answers);
  const tasks = project.pendencias ?? [];
  const tasksDone = tasks.filter(t => t.feito).length;

  return (
    <Box className="page-enter" sx={{ p: 3, pb: 6, flex: 1 }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={onBack}
            color="inherit"
            size="small"
            sx={{ color: 'text.disabled' }}
          >
            Projetos
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AssignmentTurnedInRoundedIcon />}
            onClick={() => onOpenKickoff(project.id)}
            sx={{ fontWeight: 700, flexShrink: 0 }}
          >
            Editar Kickoff
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: 'text.primary', letterSpacing: '-.4px' }}>
            {project.answers?.g_codinome || project.name || project.client}
          </Typography>
          <Chip
            label={displayCode}
            size="small"
            sx={{ fontSize: 10, height: 18, fontFamily: 'monospace', fontWeight: 700, bgcolor: '#383838', color: 'text.secondary', border: 'none' }}
          />
        </Box>
        {project.client && project.client !== (project.answers?.g_codinome || project.name) && (
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: '2px' }}>{project.client}</Typography>
        )}
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
          Atualizado em {date}
        </Typography>
      </Box>

      {/* Progress + stats row */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Paper elevation={0} sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography sx={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'text.disabled', mb: 1.25 }}>
            Prontidão
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: '6px' }}>
            <Box sx={{ flex: 1, height: 7, borderRadius: '4px', bgcolor: '#383838', overflow: 'hidden' }}>
              <Box sx={{ height: 7, borderRadius: '4px', width: progress + '%', bgcolor: progColor, transition: 'width .4s' }} />
            </Box>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: progColor, flexShrink: 0 }}>{progress}%</Typography>
          </Box>
          <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
            {Object.values(project.answers).filter(v => v && v !== '').length} respostas preenchidas
          </Typography>
        </Paper>

        {aDefinirCount > 0 && (
          <Paper elevation={0} sx={{ p: 2, minWidth: 140, cursor: 'pointer', '&:hover': { borderColor: 'rgba(255,197,0,0.3)' } }} onClick={() => onOpenKickoff(project.id)}>
            <Typography sx={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'text.disabled', mb: 1.25 }}>
              A Definir
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{aDefinirCount}</Typography>
            </Box>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: '2px' }}>perguntas pendentes</Typography>
          </Paper>
        )}
      </Box>

      {/* SharePoint URL */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
        <InsertLinkRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
        <Typography sx={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'text.disabled' }}>
          Link SharePoint
        </Typography>
      </Box>
      <Paper elevation={0} sx={{ p: '8px 14px', display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Box
          component="input"
          value={spUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpUrl(e.target.value)}
          onBlur={() => saveProject({ ...project, sharePointUrl: spUrl })}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') saveProject({ ...project, sharePointUrl: spUrl }); }}
          placeholder="https://empresa.sharepoint.com/..."
          sx={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'text.primary', fontSize: 12, fontFamily: 'inherit', minWidth: 0 }}
        />
        {spUrl && (
          <Tooltip title="Abrir no SharePoint">
            <IconButton
              size="small"
              component="a"
              href={spUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main', flexShrink: 0 }}
            >
              <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Paper>

      {/* Contacts */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <PeopleRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'text.disabled' }}>
            Contatos do Projeto
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {contacts.some(c => c.email) && (
            <Tooltip title={copiedAll ? 'Copiado!' : 'Copiar todos os e-mails (Para/CC)'}>
              <Button
                size="small"
                variant="text"
                startIcon={<ContentCopyRoundedIcon sx={{ fontSize: '13px !important' }} />}
                onClick={handleCopyAllEmails}
                sx={{
                  fontSize: 11, py: '3px',
                  color: copiedAll ? '#22c55e' : 'text.disabled',
                  '&:hover': { color: copiedAll ? '#22c55e' : 'primary.main' },
                  transition: 'color .2s',
                }}
              >
                {copiedAll ? 'Copiado!' : 'Copiar todos E-mails'}
              </Button>
            </Tooltip>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={openAddContact}
            sx={{ fontSize: 11, py: '3px' }}
          >
            Adicionar
          </Button>
        </Box>
      </Box>

      {contacts.length === 0 && (
        <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic', mb: 2 }}>
          Nenhum contato cadastrado. Adicione responsáveis, gerentes de TI, desenvolvedores do WMS, etc.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 3 }}>
        {contacts.map(c => (
          <Paper key={c.id} elevation={0} sx={{ p: '10px 14px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                bgcolor: 'rgba(255,197,0,0.08)', border: '1px solid rgba(255,197,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'primary.main',
              }}
            >
              {(c.titulo || c.email || '?').charAt(0).toUpperCase()}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.titulo || '—'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.email || '—'}
              </Typography>
              {c.phone && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {phoneMask(c.phone)}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
              {c.phone && (
                <Tooltip title="Abrir no WhatsApp">
                  <IconButton
                    size="small"
                    component="a"
                    href={`https://wa.me/55${phoneDigits(c.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'text.disabled', '&:hover': { color: '#25d366' } }}
                  >
                    <WhatsAppIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}
              {c.email && (
                <Tooltip title={copiedId === c.id ? 'Copiado!' : 'Copiar e-mail'}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyEmail(c)}
                    sx={{
                      color: copiedId === c.id ? '#22c55e' : 'text.disabled',
                      '&:hover': { color: copiedId === c.id ? '#22c55e' : 'primary.main' },
                      transition: 'color .2s',
                    }}
                  >
                    <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => openEditContact(c)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                  <EditRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remover">
                <IconButton size="small" onClick={() => setDeleteContact(c)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                  <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Pendências */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TaskAltRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'text.disabled' }}>
              Pendências
            </Typography>
            {tasks.length > 0 && (
              <Chip
                label={`${tasksDone}/${tasks.length}`}
                size="small"
                sx={{
                  fontSize: 9, height: 16, fontFamily: 'monospace', fontWeight: 700,
                  bgcolor: tasksDone === tasks.length ? 'rgba(34,197,94,0.1)' : 'rgba(255,197,0,0.08)',
                  color: tasksDone === tasks.length ? '#22c55e' : 'primary.main',
                  border: 'none',
                }}
              />
            )}
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => { setAddingTask(true); setNewTaskTitle(''); }}
            sx={{ fontSize: 11, py: '3px' }}
          >
            Nova tarefa
          </Button>
        </Box>

        {/* A Definir rows */}
        {aDefs.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#f59e0b', mb: 0.75 }}>
              A Definir no Kickoff
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {aDefs.map(s => {
                const note = (project.aDefinirNotes ?? {})[s.sectionId] ?? '';
                const isEditingNote = aDefNoteEditing === s.sectionId;
                return (
                  <Box key={s.sectionId} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: '7px', borderBottom: '1px solid rgba(58,58,58,0.4)' }}>
                    {/* Left: section info — click goes to kickoff */}
                    <Box
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, flex: 1, cursor: 'pointer', minWidth: 0 }}
                      onClick={() => onOpenKickoff(project.id)}
                    >
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b', flexShrink: 0, mt: '4px' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>{s.sectionName}</Typography>
                          <Chip label={s.count} size="small" sx={{ fontSize: 9, height: 14, bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'none', fontFamily: 'monospace', fontWeight: 700 }} />
                        </Box>
                        {!isEditingNote && note && (
                          <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: '2px' }}>{note}</Typography>
                        )}
                      </Box>
                    </Box>
                    {/* Right: note editing */}
                    {isEditingNote ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1.2 }}>
                        <TextField
                          size="small" fullWidth value={aDefNoteValue}
                          onChange={e => setADefNoteValue(e.target.value)}
                          placeholder="Observação (opcional)..."
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') saveADefNote(s.sectionId); if (e.key === 'Escape') setADefNoteEditing(null); }}
                          slotProps={{ input: { style: { fontSize: 11 } } }}
                        />
                        <Button size="small" variant="contained" color="primary" onClick={() => saveADefNote(s.sectionId)} sx={{ flexShrink: 0 }}>Ok</Button>
                        <IconButton size="small" onClick={() => setADefNoteEditing(null)}><CloseRoundedIcon sx={{ fontSize: 13 }} /></IconButton>
                      </Box>
                    ) : (
                      <Tooltip title={note ? 'Editar observação' : 'Adicionar observação'}>
                        <IconButton
                          size="small"
                          onClick={() => { setADefNoteEditing(s.sectionId); setADefNoteValue(note); }}
                          sx={{ color: note ? 'text.secondary' : 'text.disabled', '&:hover': { color: 'primary.main' }, flexShrink: 0 }}
                        >
                          <EditRoundedIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Add task inline */}
        {addingTask && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <TextField
                size="small" fullWidth value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Título da tarefa..."
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setAddingTask(false); }}
                slotProps={{ input: { style: { fontSize: 12 } } }}
              />
              <Button size="small" variant="contained" color="primary" onClick={addTask} sx={{ flexShrink: 0 }}>Ok</Button>
              <IconButton size="small" onClick={() => { setAddingTask(false); setNewTaskTitle(''); setNewTaskDesc(''); }}>
                <CloseRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <TextField
              size="small" fullWidth value={newTaskDesc}
              onChange={e => setNewTaskDesc(e.target.value)}
              placeholder="Descrição / observação (opcional)..."
              slotProps={{ input: { style: { fontSize: 11 } } }}
            />
          </Box>
        )}

        {/* Task list */}
        {tasks.length === 0 && !addingTask && aDefs.length === 0 && (
          <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic' }}>
            Nenhuma pendência registrada.
          </Typography>
        )}

        {tasks.length === 0 && !addingTask && aDefs.length > 0 && (
          <Typography sx={{ fontSize: 11, color: 'text.disabled', fontStyle: 'italic', mt: 0.5 }}>
            Nenhuma tarefa manual. Clique em Nova tarefa para adicionar.
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {tasks.map(t => (
            <Box
              key={t.id}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: '7px', borderBottom: '1px solid rgba(58,58,58,0.4)' }}
            >
              <IconButton
                size="small"
                onClick={() => toggleTask(t.id)}
                sx={{ color: t.feito ? '#22c55e' : 'text.disabled', p: '2px', flexShrink: 0, mt: '1px' }}
              >
                {t.feito
                  ? <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                  : <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16 }} />
                }
              </IconButton>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                  fontSize: 12,
                  color: t.feito ? 'text.disabled' : 'text.primary',
                  textDecoration: t.feito ? 'line-through' : 'none',
                }}>
                  {t.titulo}
                </Typography>
                {t.descricao && (
                  <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: '2px', lineHeight: 1.4 }}>
                    {t.descricao}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => openEditTask(t)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                    <EditRoundedIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir tarefa">
                  <IconButton size="small" onClick={() => setDeleteTask(t)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                    <DeleteRoundedIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* JSON Versions accordion — documentacao role only */}
      {currentRole === 'documentacao' && (
        <Box sx={{ mb: 3 }}>
          <Box
            component="button"
            onClick={() => setJsonAccordionOpen(o => !o)}
            sx={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 0.75,
              bgcolor: 'transparent', border: '1px solid', borderColor: jsonAccordionOpen ? 'rgba(255,197,0,0.3)' : 'divider',
              borderRadius: 1.5, cursor: 'pointer', px: 1.5, py: 1, color: 'text.secondary',
              '&:hover': { borderColor: 'rgba(255,197,0,0.4)', color: 'text.primary' }, transition: '.15s',
            }}
          >
            <DataObjectRoundedIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', flex: 1, textAlign: 'left' }}>
              Versões de input.json
            </Typography>
            {(project.jsonVersions?.length ?? 0) > 0 && (
              <Chip
                label={project.jsonVersions!.length}
                size="small"
                sx={{ fontSize: 9, height: 16, fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(255,197,0,0.08)', color: 'primary.main', border: 'none' }}
              />
            )}
            {jsonAccordionOpen ? <ExpandLessRoundedIcon sx={{ fontSize: 16 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />}
          </Box>

          {jsonAccordionOpen && (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {genVersionError && (
                <Box sx={{ p: '8px 12px', borderRadius: 1, bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Typography sx={{ fontSize: 11, color: '#ef4444' }}>{genVersionError}</Typography>
                </Box>
              )}
              {(project.jsonVersions ?? []).length === 0 ? (
                <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic', py: 1, px: 0.5 }}>
                  Nenhuma versão salva. Gere um documento vinculado a este projeto para registrar a primeira versão.
                </Typography>
              ) : (
                [...(project.jsonVersions ?? [])].reverse().map(v => {
                  const dt = new Date(v.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  return (
                    <Paper key={v.id} elevation={0} sx={{ p: '10px 14px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ArticleRoundedIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v.filename}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{dt}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                        <Tooltip title="Baixar JSON">
                          <IconButton size="small" onClick={() => downloadVersion(v)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                            <DownloadRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Gerar documento (.docx)">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => generateFromVersion(v)}
                              disabled={!!generatingVersion}
                              sx={{ color: 'text.disabled', '&:hover': { color: '#22c55e' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.15)' } }}
                            >
                              {generatingVersion === v.id
                                ? <CircularProgress size={12} color="inherit" />
                                : <ArticleRoundedIcon sx={{ fontSize: 14 }} />
                              }
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Excluir versão">
                          <IconButton size="small" onClick={() => setDeleteVersion(v)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                            <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Add/edit contact dialog */}
      <Dialog open={contactDialog.open} onClose={closeContactDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {contactDialog.editing ? 'Editar Contato' : 'Novo Contato'}
          <IconButton size="small" onClick={closeContactDialog}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField
              label="Cargo / Função"
              fullWidth size="small"
              value={contactDialog.titulo}
              onChange={e => setContactDialog(d => ({ ...d, titulo: e.target.value }))}
              placeholder="Ex: Dev WMS, Gestor de TI, PM"
              autoFocus
            />
            <TextField
              label="E-mail"
              fullWidth size="small"
              value={contactDialog.email}
              onChange={e => setContactDialog(d => ({ ...d, email: e.target.value }))}
              placeholder="Ex: joao@empresa.com"
              type="email"
            />
            <TextField
              label="Telefone / WhatsApp"
              fullWidth size="small"
              value={contactDialog.phone}
              onChange={e => setContactDialog(d => ({ ...d, phone: phoneMask(e.target.value) }))}
              placeholder="(DD) XXXXX-XXXX"
              error={contactDialog.phone.length > 0 && !phoneValid(contactDialog.phone)}
              helperText={contactDialog.phone.length > 0 && !phoneValid(contactDialog.phone) ? 'Número inválido — informe DDD + número (10 ou 11 dígitos)' : ''}
              onKeyDown={e => { if (e.key === 'Enter') saveContact(); }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeContactDialog} color="inherit" size="small">Cancelar</Button>
          <Button onClick={saveContact} variant="contained" color="primary" size="small" disabled={(!contactDialog.titulo.trim() && !contactDialog.email.trim()) || (contactDialog.phone.length > 0 && !phoneValid(contactDialog.phone))}>
            {contactDialog.editing ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete contact confirmation */}
      <Dialog open={!!deleteContact} onClose={() => setDeleteContact(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Remover contato
          <IconButton size="small" onClick={() => setDeleteContact(null)}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: 'text.primary', lineHeight: 1.6 }}>
            Remover <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>{deleteContact?.titulo || deleteContact?.email}</Box> dos contatos?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteContact(null)} color="inherit" size="small">Cancelar</Button>
          <Button onClick={confirmDeleteContact} variant="contained" color="error" size="small">Remover</Button>
        </DialogActions>
      </Dialog>

      {/* Edit task dialog */}
      <Dialog open={!!editTask} onClose={() => setEditTask(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Editar tarefa
          <IconButton size="small" onClick={() => setEditTask(null)}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField
              label="Título"
              fullWidth size="small"
              value={editTaskTitle}
              onChange={e => setEditTaskTitle(e.target.value)}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') saveEditTask(); }}
            />
            <TextField
              label="Descrição / observação (opcional)"
              fullWidth size="small"
              value={editTaskDesc}
              onChange={e => setEditTaskDesc(e.target.value)}
              multiline
              minRows={2}
              placeholder="Detalhes, contexto, próximos passos..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTask(null)} color="inherit" size="small">Cancelar</Button>
          <Button onClick={saveEditTask} variant="contained" color="primary" size="small" disabled={!editTaskTitle.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete JSON version confirmation */}
      <Dialog open={!!deleteVersion} onClose={() => setDeleteVersion(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
            ALERTA, TEM CERTEZA?
          </Box>
          <IconButton size="small" onClick={() => setDeleteVersion(null)}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.6 }}>
            Excluir a versão <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>"{deleteVersion?.filename}"</Box>?
            Esta ação é irreversível.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteVersion(null)} color="inherit" size="small">Cancelar</Button>
          <Button onClick={confirmDeleteVersion} variant="contained" color="error" size="small" sx={{ fontWeight: 700 }}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete task confirmation */}
      <Dialog open={!!deleteTask} onClose={() => setDeleteTask(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Excluir tarefa
          <IconButton size="small" onClick={() => setDeleteTask(null)}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: 'text.primary', lineHeight: 1.6 }}>
            Excluir a tarefa <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>"{deleteTask?.titulo}"</Box>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTask(null)} color="inherit" size="small">Cancelar</Button>
          <Button onClick={confirmDeleteTask} variant="contained" color="error" size="small">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
