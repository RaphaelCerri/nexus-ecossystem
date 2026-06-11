import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import type { NexusProject } from '../lib/projectStore';
import { generateCode, generateId, upsertProject } from '../lib/projectStore';
import { isDangerousKey, readUploadAsText, safeJsonParse } from '../lib/security';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (project: NexusProject) => void;
}

interface ImportedData {
  client: string;
  name: string;
  answers: Record<string, string>;
  notes: Record<string, string>;
  pblLines: object[];
  osDevices: object[];
  mezDetails: string[];
  etiquetas: object[];
  fileName: string;
  answerCount: number;
}

export function NewKickoffModal({ open, onClose, onCreate }: Props) {
  const [mode, setMode] = useState<'new' | 'import'>('new');
  const [client, setClient] = useState('');
  const [name, setName] = useState('');
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setClient('');
    setName('');
    setImportedData(null);
    setImportError('');
    setMode('new');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleCreate = () => {
    if (!client.trim()) return;
    const now = new Date().toISOString();
    const project: NexusProject = {
      id: generateId(),
      code: generateCode(),
      client: client.trim(),
      name: name.trim() || client.trim(),
      createdAt: now,
      updatedAt: now,
      answers: {},
      notes: {},
      pblLines: [{}],
      osDevices: [],
      mezDetails: [],
      etiquetas: [],
    };
    upsertProject(project);
    onCreate(project);
    reset();
  };

  const handleImportCreate = () => {
    if (!importedData) return;
    const now = new Date().toISOString();
    const project: NexusProject = {
      id: generateId(),
      code: generateCode(),
      client: importedData.client || 'Importado',
      name: importedData.name || importedData.client || 'Kickoff importado',
      createdAt: now,
      updatedAt: now,
      answers: importedData.answers,
      notes: importedData.notes,
      pblLines: importedData.pblLines.length ? importedData.pblLines : [{}],
      osDevices: importedData.osDevices,
      mezDetails: importedData.mezDetails,
      etiquetas: importedData.etiquetas,
    };
    upsertProject(project);
    onCreate(project);
    reset();
  };

  const handleFile = async (file: File) => {
    setImportError('');
    setImportedData(null);
    try {
      const text = await readUploadAsText(file);
      const j = safeJsonParse(text) as Record<string, unknown>;
      if (!j || typeof j !== 'object' || Array.isArray(j)) {
        setImportError('Arquivo inválido. Certifique-se de selecionar um JSON exportado pelo Nexus.');
        return;
      }
      const flat: Record<string, string> = {};
      if (j.sections && typeof j.sections === 'object') {
        Object.values(j.sections).forEach((sec: unknown) => {
          if (sec && typeof sec === 'object' && !Array.isArray(sec)) {
            Object.entries(sec as Record<string, unknown>).forEach(([k, v]) => {
              if (isDangerousKey(k)) return;
              if (typeof v === 'string') flat[k] = v;
            });
          }
        });
      }
      const notes: Record<string, string> = {};
      if (j.notes && typeof j.notes === 'object' && !Array.isArray(j.notes)) {
        Object.entries(j.notes as Record<string, unknown>).forEach(([k, v]) => {
          if (isDangerousKey(k)) return;
          if (typeof v === 'string') notes[k] = v;
        });
      }
      const meta = (j.meta && typeof j.meta === 'object' ? j.meta : {}) as Record<string, unknown>;
      const answerCount = Object.values(flat).filter(v => v && v !== '').length;
      setImportedData({
        client: flat.g1 || (typeof meta.project === 'string' ? meta.project : '') || '',
        name: flat.g2 || '',
        answers: flat,
        notes,
        pblLines: Array.isArray(j.pbl_lines) ? j.pbl_lines as object[] : [],
        osDevices: Array.isArray(j.os_devices) ? j.os_devices as object[] : [],
        mezDetails: Array.isArray(j.mez_details) ? (j.mez_details as unknown[]).filter((m): m is string => typeof m === 'string') : [],
        etiquetas: Array.isArray(j.etiquetas_custom) ? j.etiquetas_custom as object[] : [],
        fileName: file.name,
        answerCount,
      });
    } catch (err) {
      setImportError(err instanceof SyntaxError
        ? 'Arquivo inválido. Certifique-se de selecionar um JSON exportado pelo Nexus.'
        : err instanceof Error ? err.message : 'Falha ao ler o arquivo.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && client.trim()) handleCreate();
  };

  const canCreate = mode === 'new' ? !!client.trim() : !!importedData;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentTurnedInRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" component="span">Novo Kickoff</Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}><CloseRoundedIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Mode switcher */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => v && setMode(v)}
          fullWidth
          size="small"
          sx={{ mb: 2.5, mt: 0.5 }}
        >
          <ToggleButton value="new">Preencher agora</ToggleButton>
          <ToggleButton value="import">Importar JSON</ToggleButton>
        </ToggleButtonGroup>

        {mode === 'new' && (
          <Stack spacing={2}>
            <TextField
              label="Cliente"
              fullWidth
              size="small"
              value={client}
              onChange={e => setClient(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Magazine Luiza"
              autoFocus
              required
            />
            <TextField
              label="Nome do Projeto"
              fullWidth
              size="small"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: CD São Paulo — Sorter"
              helperText="Opcional — ajuda a identificar este kickoff"
            />
          </Stack>
        )}

        {mode === 'import' && (
          <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6 }}>
              Selecione um arquivo <strong>.json</strong> exportado por um kickoff anterior. Todas as respostas serão importadas automaticamente.
            </Typography>

            <Button
              variant="outlined"
              color={importedData ? 'success' : 'inherit'}
              fullWidth
              size="small"
              startIcon={importedData ? <CheckCircleRoundedIcon /> : <UploadFileRoundedIcon />}
              onClick={() => fileRef.current?.click()}
              sx={{
                borderColor: importedData ? 'rgba(34,197,94,0.5)' : 'divider',
                color: importedData ? '#22c55e' : 'text.secondary',
                fontWeight: 600,
                justifyContent: 'flex-start',
                py: 1,
              }}
            >
              {importedData ? importedData.fileName : 'Selecionar arquivo JSON'}
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
            />

            {importedData && (
              <Box sx={{ p: '10px 12px', borderRadius: 1.5, bgcolor: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#22c55e', mb: '3px' }}>
                  ✓ Arquivo válido
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  Cliente: <strong>{importedData.client || '—'}</strong>
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  {importedData.answerCount} respostas preenchidas
                </Typography>
              </Box>
            )}

            {importError && (
              <Typography sx={{ fontSize: 12, color: 'error.main' }}>{importError}</Typography>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" size="small">Cancelar</Button>
        <Button
          onClick={mode === 'new' ? handleCreate : handleImportCreate}
          variant="contained"
          color="primary"
          size="small"
          disabled={!canCreate}
          sx={{ fontWeight: 700 }}
        >
          {mode === 'new' ? 'Criar Kickoff' : 'Importar e Abrir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
