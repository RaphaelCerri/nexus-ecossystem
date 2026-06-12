import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';

type Page = 'kickoff' | 'projetos' | 'ferramentas' | 'dashboard' | 'config' | 'sugestoes' | 'documentacao';

export const ROLES = [
  { value: 'gestao',          label: 'Gestão' },
  { value: 'engenharia',      label: 'Engenharia' },
  { value: 'documentacao',    label: 'Documentação' },
  { value: 'pmo',             label: 'PMO' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'eletrica',        label: 'Elétrica' },
  { value: 'adm',             label: 'Administrador' },
] as const;

export type Role = typeof ROLES[number]['value'];

interface NavItem { id: Page; label: string; Icon: React.ElementType; }

const NAV_DEFAULT: NavItem[] = [
  { id: 'projetos',    label: 'Projetos',       Icon: FolderRoundedIcon },
  { id: 'kickoff',     label: 'Kickoff',         Icon: AssignmentTurnedInRoundedIcon },
  { id: 'ferramentas', label: 'Ferramentas I.A', Icon: BuildRoundedIcon },
  { id: 'dashboard',   label: 'Dashboard',       Icon: DashboardRoundedIcon },
  { id: 'sugestoes',   label: 'Sugestões',       Icon: TipsAndUpdatesRoundedIcon },
];

const NAV_DOC: NavItem = { id: 'documentacao', label: 'Documentação', Icon: ArticleRoundedIcon };

const NAV_BOTTOM: NavItem[] = [
  { id: 'config', label: 'Configurações', Icon: SettingsRoundedIcon },
];

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  role: Role;
  onRoleChange: (role: Role) => void;
  userName: string;
  onLogout: () => void;
}

export function Sidebar({ current, onNavigate, role, onRoleChange, userName, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [admClicks, setAdmClicks] = useState(0);
  const [admHint, setAdmHint] = useState(false);
  const admHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    const next = admClicks + 1;
    if (next >= 10) {
      setAdmClicks(0);
      setAdmHint(true);
      if (admHintTimer.current) clearTimeout(admHintTimer.current);
      admHintTimer.current = setTimeout(() => setAdmHint(false), 5000);
    } else {
      setAdmClicks(next);
    }
  };

  useEffect(() => {
    if (!admHint) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'y' || e.key === 'Y') {
        onRoleChange('adm');
        setAdmHint(false);
        if (admHintTimer.current) clearTimeout(admHintTimer.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [admHint, onRoleChange]);
  const W = collapsed ? 56 : 220;
  const NAV = role === 'documentacao'
    ? [...NAV_DEFAULT, NAV_DOC]
    : NAV_DEFAULT;
  const roleLabel = ROLES.find(r => r.value === role)?.label ?? role;
  const firstName = userName.split(' ')[0] || 'Usuário';
  const initial = firstName[0]?.toUpperCase() ?? 'U';

  const navItemSx = (isActive: boolean) => ({
    position: 'relative',
    borderRadius: '8px',
    mb: '2px',
    pl: collapsed ? 0 : '12px',
    pr: collapsed ? 0 : '8px',
    minHeight: 36,
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: 1.25,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: isActive ? '#ffc500' : 'rgba(255,255,255,0.45)',
    bgcolor: isActive ? 'rgba(255,197,0,0.08)' : 'transparent',
    '&::before': isActive ? {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '18%',
      bottom: '18%',
      width: '3px',
      borderRadius: '0 3px 3px 0',
      bgcolor: '#ffc500',
    } : {},
    '&:hover': {
      bgcolor: isActive ? 'rgba(255,197,0,0.10)' : 'rgba(255,255,255,0.04)',
      color: isActive ? '#ffc500' : 'rgba(255,255,255,0.75)',
    },
    transition: 'background-color 0.15s, color 0.15s',
  } as const);

  const renderNavItem = ({ id, label, Icon }: NavItem) => {
    const isActive = current === id;
    const btn = (
      <Box key={id} component="button" onClick={() => onNavigate(id)} sx={navItemSx(isActive)}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: collapsed ? '100%' : 28, height: 36, flexShrink: 0 }}>
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        {!collapsed && (
          <Typography sx={{ fontSize: 13, fontWeight: isActive ? 600 : 500, lineHeight: 1, whiteSpace: 'nowrap', color: 'inherit' }}>
            {label}
          </Typography>
        )}
      </Box>
    );
    return collapsed ? (
      <Tooltip key={id} title={label} placement="right" arrow>{btn}</Tooltip>
    ) : btn;
  };

  return (
    <Box sx={{ position: 'relative', flexShrink: 0, height: '100vh' }}>
      <Box
        component="aside"
        sx={{
          width: W,
          height: '100vh',
          bgcolor: '#111111',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Logo row */}
        <Box
          onClick={handleLogoClick}
          sx={{
            height: 52,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            userSelect: 'none',
            cursor: 'default',
          }}
        >
          {collapsed ? (
            <Box
              component="img"
              src="/nexus-icon.png"
              alt="N"
              sx={{ width: 22, height: 22, objectFit: 'contain', opacity: 0.8 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                component="img"
                src="/nexus-logo.png"
                alt="NEXUS"
                sx={{ height: 28, display: 'block' }}
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement;
                  t.style.display = 'none';
                  const n = t.nextElementSibling as HTMLElement | null;
                  if (n) n.style.display = 'block';
                }}
              />
              <Typography sx={{ display: 'none', color: 'primary.main', fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>
                NEXUS
              </Typography>
            </Box>
          )}
          {admHint && (
            <Box sx={{
              position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
              bgcolor: '#ffc500', color: '#0b0e14', fontSize: 9, fontWeight: 800,
              px: '7px', py: '3px', borderRadius: '4px', whiteSpace: 'nowrap',
              zIndex: 100, letterSpacing: '0.5px', pointerEvents: 'none',
            }}>
              PRESSIONE Y
            </Box>
          )}
        </Box>

        {/* Main nav */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: collapsed ? '12px 6px 0' : '14px 10px 0' }}>
          {!collapsed && (
            <Typography sx={{ fontSize: 9.5, color: 'text.disabled', fontWeight: 700, letterSpacing: '1px', px: '6px', pb: '8px', textTransform: 'uppercase' }}>
              Menu
            </Typography>
          )}
          <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column' }}>
            {NAV.map(renderNavItem)}
          </List>
        </Box>

        {/* Bottom section */}
        <Box sx={{ p: collapsed ? '8px 6px' : '8px 10px', borderTop: '1px solid', borderColor: 'divider' }}>
          <List dense disablePadding sx={{ mb: 1 }}>
            {NAV_BOTTOM.map(renderNavItem)}
          </List>

          {!collapsed && (
            <>
              <Select
                value={role}
                onChange={(e) => onRoleChange(e.target.value as Role)}
                fullWidth size="small"
                sx={{ fontSize: 12 }}
              >
                {ROLES.filter(r => r.value !== 'adm' || role === 'adm').map(r => (
                  <MenuItem key={r.value} value={r.value} sx={{ fontSize: 12 }}>{r.label}</MenuItem>
                ))}
              </Select>

              <Box
                sx={{
                  mt: 1, p: '8px 10px', borderRadius: 2,
                  bgcolor: 'background.default',
                  border: '1px solid', borderColor: 'divider',
                  display: 'flex', alignItems: 'center', gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 28, height: 28, borderRadius: '50%',
                    bgcolor: 'rgba(255,197,0,0.10)',
                    border: '1px solid rgba(255,197,0,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'primary.main', flexShrink: 0,
                  }}
                >
                  {initial}
                </Box>
                <Box sx={{ overflow: 'hidden', flex: 1 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {firstName}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{roleLabel}</Typography>
                </Box>
                <Tooltip title="Sair">
                  <IconButton
                    size="small"
                    onClick={onLogout}
                    sx={{ color: 'text.disabled', '&:hover': { color: '#ef4444' }, p: '4px', flexShrink: 0 }}
                  >
                    <LogoutRoundedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          )}

          {collapsed && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <Tooltip title={`${firstName} · ${roleLabel}`} placement="right">
                <Box
                  sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    bgcolor: 'rgba(255,197,0,0.10)',
                    border: '1px solid rgba(255,197,0,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'primary.main',
                    cursor: 'default',
                  }}
                >
                  {initial}
                </Box>
              </Tooltip>
              <Tooltip title="Sair" placement="right">
                <IconButton
                  size="small"
                  onClick={onLogout}
                  sx={{ color: 'text.disabled', '&:hover': { color: '#ef4444' }, p: '4px' }}
                >
                  <LogoutRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      <Tooltip title={collapsed ? 'Expandir menu' : 'Recolher menu'} placement="right">
        <IconButton
          size="small"
          onClick={() => setCollapsed(c => !c)}
          sx={{
            position: 'absolute',
            top: 12,
            right: -13,
            width: 14,
            height: 28,
            borderRadius: '0 6px 6px 0',
            bgcolor: '#111111',
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: 'none',
            color: 'text.disabled',
            zIndex: 51,
            p: 0,
            '&:hover': { color: 'primary.main', bgcolor: 'rgba(255,197,0,0.08)' },
          }}
        >
          {collapsed
            ? <ChevronRightRoundedIcon sx={{ fontSize: 12 }} />
            : <ChevronLeftRoundedIcon sx={{ fontSize: 12 }} />
          }
        </IconButton>
      </Tooltip>
    </Box>
  );
}
