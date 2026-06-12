import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { NexusProject } from '../../lib/projectStore';
import { loadProjects, deleteProject, upsertProject, getProgress } from '../../lib/projectStore';

function applyProjectCodeMask(v: string): string {
  let s = v.toUpperCase().replace(/[^I0-9]/g, '');
  if (!s.startsWith('I')) s = 'I' + s.replace(/I/g, '');
  const digits = s.slice(1).replace(/\./g, '');
  if (digits.length <= 2) return 'I' + digits;
  return 'I' + digits.slice(0, 2) + '.' + digits.slice(2, 6);
}

interface Props {
  onOpenProject: (project: NexusProject) => void;
  onOpenKickoff?: (projectId: string) => void;
  onNewKickoff: () => void;
  refreshKey?: number;
}

export function ProjetosPage({ onOpenProject, onOpenKickoff, onNewKickoff, refreshKey }: Props) {
  const [projects, setProjects] = useState<NexusProject[]>([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<NexusProject | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCodinome, setEditCodinome] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editCode, setEditCode] = useState('');

  useEffect(() => {
    setProjects(loadProjects());
  }, [refreshKey]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? projects.filter(p =>
        p.client.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        (p.answers?.g2 || p.code).toLowerCase().includes(q) ||
        p.answers?.g_codinome?.toLowerCase().includes(q)
      )
    : projects;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    setProjects(loadProjects());
    setDeleteTarget(null);
  };

  const startEdit = (e: React.MouseEvent, p: NexusProject) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditCodinome(p.answers?.g_codinome || p.name || '');
    setEditClient(p.client);
    setEditCode(p.answers?.g2 || p.code);
  };

  const saveEdit = (e: React.MouseEvent, p: NexusProject) => {
    e.stopPropagation();
    const newCodinome = editCodinome.trim();
    const newClient = editClient.trim() || p.client;
    const newCode = editCode.trim() || (p.answers?.g2 || p.code);
    upsertProject({
      ...p,
      client: newClient,
      name: newCodinome || p.name,
      code: newCode,
      answers: { ...p.answers, g1: newClient, g2: newCode, ...(newCodinome ? { g_codinome: newCodinome } : {}) },
      updatedAt: new Date().toISOString(),
    });
    setProjects(loadProjects());
    setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <Box className="page-enter" sx={{ p: 3, flex: 1 }}>

      {/* Search + New button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <TextField
        fullWidth size="small"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        placeholder="Buscar por cliente, código, codinome..."
        sx={{ flex: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 16, color: search ? 'primary.main' : 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')} sx={{ color: 'text.disabled' }}>
                  <CloseRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={onNewKickoff}
          sx={{ fontWeight: 700, flexShrink: 0 }}
        >
          Novo Kickoff
        </Button>
      </Box>

      {/* Empty state */}
      {projects.length === 0 && (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center' }}>
          <FolderOpenRoundedIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.4, mb: 1.5 }} />
          <Typography sx={{ color: 'text.secondary', mb: 0.5 }}>Nenhum kickoff salvo ainda.</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', mb: 2.5 }}>
            Crie o primeiro kickoff para começar.
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddRoundedIcon />} onClick={onNewKickoff} sx={{ fontWeight: 700 }}>
            Criar primeiro Kickoff
          </Button>
        </Paper>
      )}

      {/* Empty search result */}
      {projects.length > 0 && filtered.length === 0 && (
        <Typography sx={{ color: 'text.disabled', fontSize: 13, py: 3, textAlign: 'center' }}>
          Nenhum projeto encontrado para "{search}".
        </Typography>
      )}

      {/* Project list */}
      <Stack spacing={1.5}>
        {filtered.map(p => {
          const isEditing = editingId === p.id;
          const progress = getProgress(p);
          const progColor = progress === 100 ? '#22c55e' : progress > 0 ? '#ffc500' : '#666';
          const date = new Date(p.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
          const displayCode = p.answers?.g2 || p.code;
          return (
            <Paper
              key={p.id}
              elevation={0}
              onClick={() => !isEditing && onOpenProject(p)}
              sx={{
                p: 2,
                cursor: isEditing ? 'default' : 'pointer',
                transition: '.15s',
                '&:hover': isEditing ? {} : { borderColor: 'rgba(255,197,0,0.35)', bgcolor: 'rgba(255,197,0,0.03)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>

                {/* Left: project info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <TextField
                        size="small"
                        value={editCodinome}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCodinome(e.target.value)}
                        label="Codinome"
                        placeholder="Ex: Projeto Colibri"
                        autoFocus
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') saveEdit(e as unknown as React.MouseEvent, p); if (e.key === 'Escape') cancelEdit(e as unknown as React.MouseEvent); }}
                        sx={{ width: 180 }}
                        slotProps={{ input: { style: { fontSize: 13, fontWeight: 600 } } }}
                      />
                      <TextField
                        size="small"
                        value={editClient}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditClient(e.target.value)}
                        label="Cliente"
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') saveEdit(e as unknown as React.MouseEvent, p); if (e.key === 'Escape') cancelEdit(e as unknown as React.MouseEvent); }}
                        sx={{ width: 180 }}
                        slotProps={{ input: { style: { fontSize: 13 } } }}
                      />
                      <TextField
                        size="small"
                        value={editCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCode(applyProjectCodeMask(e.target.value))}
                        label="Código"
                        placeholder="I24.001"
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') saveEdit(e as unknown as React.MouseEvent, p); if (e.key === 'Escape') cancelEdit(e as unknown as React.MouseEvent); }}
                        sx={{ width: 130 }}
                        slotProps={{ input: { style: { fontSize: 12, fontFamily: 'monospace' } } }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>
                        {p.answers?.g_codinome || p.name || p.client}
                      </Typography>
                      <Chip
                        label={displayCode}
                        size="small"
                        sx={{ fontSize: 10, height: 18, fontFamily: 'monospace', fontWeight: 700, bgcolor: '#383838', color: 'text.secondary', border: 'none' }}
                      />
                      {p.answers?.g_codinome && (
                        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                          {p.client}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {!isEditing && p.name && p.name !== p.client && p.name !== p.answers?.g_codinome && (
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.75 }}>
                      {p.name}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 100, height: 4, borderRadius: '2px', bgcolor: '#383838', overflow: 'hidden' }}>
                      <Box sx={{ height: 4, borderRadius: '2px', width: progress + '%', bgcolor: progColor, transition: 'width .4s' }} />
                    </Box>
                    <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: progColor, fontWeight: 600 }}>
                      {progress}%
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                      {Object.values(p.answers).filter(v => v && v !== '').length} respostas
                    </Typography>
                  </Box>
                </Box>

                {/* Right: date + actions */}
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  {isEditing ? (
                    <>
                      <Tooltip title="Salvar">
                        <IconButton size="small" onClick={e => saveEdit(e, p)} sx={{ color: '#22c55e', '&:hover': { color: '#16a34a' } }}>
                          <CheckRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancelar">
                        <IconButton size="small" onClick={cancelEdit} sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}>
                          <CloseRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled', mr: 0.5 }}>
                        {date}
                      </Typography>
                      <Tooltip title="Editar cliente / código">
                        <IconButton
                          size="small"
                          onClick={e => startEdit(e, p)}
                          sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
                        >
                          <EditRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      {onOpenKickoff && (
                        <Tooltip title="Editar Kickoff">
                          <IconButton
                            size="small"
                            onClick={() => onOpenKickoff(p.id)}
                            sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
                          >
                            <AssignmentTurnedInRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Excluir projeto">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(p)}
                          sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Stack>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Excluir projeto
          <IconButton size="small" onClick={() => setDeleteTarget(null)}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: 'text.primary', lineHeight: 1.6 }}>
            Excluir o kickoff{' '}
            <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {deleteTarget?.client}
            </Box>
            {' '}({deleteTarget?.answers?.g2 || deleteTarget?.code})? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} color="inherit" size="small">Cancelar</Button>
          <Button onClick={handleDelete} variant="contained" color="error" size="small">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
