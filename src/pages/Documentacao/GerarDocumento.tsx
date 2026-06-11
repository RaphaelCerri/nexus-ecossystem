import { useState, useRef } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import { ProjectPickerModal } from '../../components/ProjectPickerModal';
import type { NexusProject } from '../../lib/projectStore';
import { generateDocx } from '../../lib/docxBuilder';
import type { InputJson, UserInfo } from '../../lib/docxBuilder';
import { readUploadAsText, safeJsonParse, validateInputJson } from '../../lib/security';

function getCurrentUser(): UserInfo | undefined {
  try {
    const session = JSON.parse(localStorage.getItem('nexus_session') ?? 'null') as { name: string } | null;
    if (!session?.name) return undefined;
    const users = JSON.parse(localStorage.getItem('nexus_users') ?? '{}') as Record<string, { name: string }>;
    const match = Object.entries(users).find(([, u]) => u.name === session.name);
    return { name: session.name, email: match ? match[0] : '' };
  } catch { return undefined; }
}

export function GerarDocumento() {
  const [pickerOpen,     setPickerOpen]     = useState(false);
  const [project,        setProject]        = useState<NexusProject | null>(null);
  const [inputJson,      setInputJson]      = useState<InputJson | null>(null);
  const [inputFilename,  setInputFilename]  = useState('');
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [lastGenerated,  setLastGenerated]  = useState<string | null>(null);
  const [removedCount,   setRemovedCount]   = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // reset so the same file can be re-selected
    e.target.value = '';
    if (!file) return;
    setError(null);
    setLastGenerated(null);
    setInputFilename(file.name);
    setInputJson(null);
    if (!/\.json$/i.test(file.name)) {
      setError('Selecione um arquivo .json.');
      return;
    }
    try {
      const text = await readUploadAsText(file);
      const parsed = safeJsonParse(text);
      const validation = validateInputJson(parsed);
      if (!validation.ok) {
        setError('JSON inválido: ' + validation.errors.slice(0, 5).join(' '));
        return;
      }
      setInputJson(parsed as InputJson);
    } catch (err) {
      setError(err instanceof SyntaxError
        ? 'Arquivo inválido: não é um JSON válido.'
        : err instanceof Error ? err.message : 'Falha ao ler o arquivo.');
    }
  };

  const handleGenerate = async () => {
    if (!inputJson) return;
    setLoading(true);
    setError(null);
    setLastGenerated(null);
    try {
      const resp = await fetch('/ES_PLACEHOLDER_v6.docx');
      if (!resp.ok) throw new Error('Template não encontrado. Contate o administrador.');
      const templateBytes = await resp.arrayBuffer();
      const result = await generateDocx(templateBytes, inputJson, getCurrentUser());

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setRemovedCount(result.internalBlocksRemoved.length);
      setLastGenerated(result.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao gerar documento.');
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = !!project && !!inputJson && !loading;

  const dottedBtn = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: '10px 14px',
    bgcolor: 'transparent',
    border: '1px dashed',
    borderColor: 'divider',
    cursor: 'pointer',
    borderRadius: 1.5,
    color: 'text.secondary',
    fontSize: 13,
    fontWeight: 500,
    transition: '.15s',
    '&:hover': { borderColor: 'rgba(255,197,0,0.4)', color: 'text.primary' },
  } as const;

  return (
    <Box sx={{ p: 3, maxWidth: 620, mx: 'auto' }}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3.5, lineHeight: 1.7 }}>
        Selecione o projeto e faça o upload do <code style={{ fontSize: 12 }}>input.json</code> gerado
        pelo Especialista Documentador para gerar a Especificação de Software no padrão Invent.
      </Typography>

      {/* ── Step 1: Projeto ─────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.disabled', letterSpacing: '1.2px', textTransform: 'uppercase', mb: '8px' }}>
          1 · Projeto vinculado
        </Typography>

        {project ? (
          <Paper elevation={0} sx={{ p: '10px 14px', border: '1px solid', borderColor: 'primary.main', borderRadius: 1.5, bgcolor: 'rgba(255,197,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {project.name || 'Nome do projeto'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {project.client}
              </Typography>
            </Box>
            <Button size="small" variant="text" onClick={() => setPickerOpen(true)} sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }}>
              Trocar
            </Button>
          </Paper>
        ) : (
          <Paper elevation={0} component="button" onClick={() => setPickerOpen(true)} sx={dottedBtn}>
            <FolderOpenRoundedIcon sx={{ fontSize: 18 }} />
            Selecionar projeto existente
          </Paper>
        )}
      </Box>

      {/* ── Step 2: input.json ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.disabled', letterSpacing: '1.2px', textTransform: 'uppercase', mb: '8px' }}>
          2 · Arquivo input.json
        </Typography>

        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {inputJson ? (
          <Paper elevation={0} sx={{ p: '10px 14px', border: '1px solid', borderColor: 'rgba(34,197,94,0.45)', borderRadius: 1.5, bgcolor: 'rgba(34,197,94,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {inputFilename}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                {inputJson.meta?.projeto || 'Projeto sem nome'} · Rev {inputJson.meta?.revisao || '01'} · {(inputJson.capitulos ?? []).length} capítulos
              </Typography>
            </Box>
            <Button size="small" variant="text" onClick={() => fileRef.current?.click()} sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }}>
              Trocar
            </Button>
          </Paper>
        ) : (
          <Paper elevation={0} component="button" onClick={() => fileRef.current?.click()} sx={dottedBtn}>
            <FileUploadRoundedIcon sx={{ fontSize: 18 }} />
            Selecionar input.json
          </Paper>
        )}
      </Box>

      {/* ── Feedback ────────────────────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: 12 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {lastGenerated && !error && (
        <Alert severity="success" sx={{ mb: 2, fontSize: 12 }}>
          Download iniciado: <strong>{lastGenerated}</strong>
          {removedCount > 0 && (
            <Box component="span" sx={{ display: 'block', mt: '4px', fontSize: 11, opacity: 0.85 }}>
              {removedCount} bloco{removedCount > 1 ? 's' : ''} interno{removedCount > 1 ? 's' : ''} ([OBS INTERNA] / [ATENÇÃO CRÍTICA]) removido{removedCount > 1 ? 's' : ''} do documento.
            </Box>
          )}
        </Alert>
      )}

      {/* ── Generate button ─────────────────────────────────────────────────── */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!canGenerate}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadRoundedIcon />}
        onClick={handleGenerate}
        sx={{ fontWeight: 800, fontSize: 14, py: 1.25 }}
      >
        {loading ? 'Gerando documento...' : 'Gerar e Baixar Documento'}
      </Button>

      {!project && !inputJson && (
        <Typography sx={{ mt: 1.5, fontSize: 11, color: 'text.disabled', textAlign: 'center' }}>
          Preencha os dois campos acima para habilitar a geração.
        </Typography>
      )}

      <ProjectPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(p) => { setProject(p); setPickerOpen(false); }}
      />
    </Box>
  );
}
