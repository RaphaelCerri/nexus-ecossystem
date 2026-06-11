import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Fade from '@mui/material/Fade';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { ROLES } from '../components/Sidebar';
import type { Role } from '../components/Sidebar';
import { generateSalt, hashPassword, verifyPassword } from '../lib/passwordHash';
import { safeJsonParse } from '../lib/security';

// ─── Local user storage ───────────────────────────────────────────────────────
// Senha nunca é guardada em texto puro: apenas salt + hash PBKDF2.
// `password` permanece no tipo só para migrar contas antigas no próximo login.
interface StoredUser {
  name: string;
  email: string;
  role: Role;
  salt?: string;
  passwordHash?: string;
  /** legado (texto puro) — removido automaticamente na migração */
  password?: string;
}
const USERS_KEY = 'nexus_users';

function getUsers(): Record<string, StoredUser> {
  try { return (safeJsonParse(localStorage.getItem(USERS_KEY) ?? '{}') as Record<string, StoredUser>) ?? {}; }
  catch { return {}; }
}
function saveUser(u: StoredUser) {
  const users = getUsers();
  users[u.email] = u;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function findUser(email: string): StoredUser | null {
  return getUsers()[email] ?? null;
}

async function createUser(name: string, email: string, senha: string, role: Role): Promise<void> {
  const salt = generateSalt();
  const passwordHash = await hashPassword(senha, salt);
  saveUser({ name, email, role, salt, passwordHash });
}

/** Verifica a senha; migra contas legadas (texto puro) para salt+hash. */
async function checkPassword(user: StoredUser, senha: string): Promise<boolean> {
  if (user.salt && user.passwordHash) {
    return verifyPassword(senha, user.salt, user.passwordHash);
  }
  // conta legada: compara texto puro e migra imediatamente para hash
  if (user.password !== undefined) {
    if (user.password !== senha) return false;
    const salt = generateSalt();
    const passwordHash = await hashPassword(senha, salt);
    saveUser({ name: user.name, email: user.email, role: user.role, salt, passwordHash });
    return true;
  }
  return false;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@invent-corp\.com$/;

function toTitleCase(v: string) {
  return v
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\B\w/g, c => c.toLowerCase());
}

function getSenhaStrength(pw: string): 1 | 2 | 3 | 4 {
  if (pw.length < 6) return 1;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return s >= 4 ? 4 : s >= 2 ? 3 : 2;
}

const STRENGTH_LABEL: Record<1|2|3|4, string> = { 1:'Fraca', 2:'Média', 3:'Boa', 4:'Muito boa' };
const STRENGTH_COLOR: Record<1|2|3|4, string> = { 1:'#ef4444', 2:'#f59e0b', 3:'#84cc16', 4:'#22c55e' };

// ─── Styles ───────────────────────────────────────────────────────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    transition: 'background .2s',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.065)' },
    '& fieldset': { borderColor: 'rgba(255,255,255,0.09)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.06)' },
    '&.Mui-focused fieldset': { borderColor: '#ffc500 !important', borderWidth: '1.5px' },
    '&.Mui-error fieldset': { borderColor: 'rgba(239,68,68,0.6) !important' },
    '& input': {
      color: '#fff', fontSize: 14, fontWeight: 500,
      '&::placeholder': { color: 'rgba(255,255,255,0.28)', opacity: 1 },
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px rgba(8,10,20,0.9) inset',
      WebkitTextFillColor: '#fff',
    },
  },
  '& .MuiFormHelperText-root': { fontSize: 11, mt: '4px', color: 'rgba(239,68,68,0.85)' },
};

const selectSx = {
  bgcolor: 'rgba(255,255,255,0.04)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: 14,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.09)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffc500', borderWidth: '1.5px' },
  '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.35)' },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  onLogin: (nome: string, role: Role) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LoginPage({ onLogin }: Props) {
  const [tab, setTab] = useState<'login' | 'registro'>('login');
  const [entering, setEntering] = useState(false);

  const switchTab = (t: 'login' | 'registro') => { if (t !== tab) setTab(t); };

  const submit = (nome: string, role: Role) => {
    setEntering(true);
    setTimeout(() => onLogin(nome, role), 320);
  };

  return (
    <Box
      sx={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundImage: 'url(/sorter-invent.webp)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        bgcolor: '#0a0c14',
        transition: 'opacity .35s ease',
        opacity: entering ? 0 : 1,
      }}
    >
      {/* Dark overlay */}
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.68) 50%,rgba(0,0,0,0.80) 100%)', pointerEvents: 'none' }} />

      {/* Ambient glow */}
      <Box sx={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,197,0,0.055) 0%,transparent 68%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Glass card */}
      <Fade in timeout={700}>
        <Box
          sx={{
            position: 'relative', width: '100%', maxWidth: 420, mx: 2,
            p: '36px 40px 32px',
            borderRadius: '22px',
            background: 'rgba(7,9,18,0.38)',
            backdropFilter: 'blur(24px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 24px 72px rgba(0,0,0,0.55),0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: '28px' }}>
            <Box
              component="img"
              src="/nexus-logo.png"
              alt="NEXUS"
              sx={{ height: 44, objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(255,197,0,0.35))' }}
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                t.style.display = 'none';
                const n = t.nextElementSibling as HTMLElement | null;
                if (n) n.style.display = 'flex';
              }}
            />
            <Typography sx={{ display: 'none', fontSize: 15, fontWeight: 900, letterSpacing: '3.5px', color: '#fff', fontFamily: 'Arial Black,sans-serif', textTransform: 'uppercase' }}>
              NEXUS
            </Typography>
          </Box>

          {/* Tab toggle */}
          <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px', p: '4px', mb: '28px', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['login', 'registro'] as const).map(t => (
              <Box
                key={t}
                onClick={() => switchTab(t)}
                sx={{
                  flex: 1, textAlign: 'center', py: '8px', borderRadius: '7px', cursor: 'pointer',
                  bgcolor: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: tab === t ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  transition: 'all .18s ease',
                  '&:hover': { bgcolor: tab === t ? undefined : 'rgba(255,255,255,0.04)' },
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'color .18s' }}>
                  {t === 'login' ? 'Entrar' : 'Criar conta'}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Forms */}
          {tab === 'login'
            ? <LoginForm onSubmit={submit} />
            : <RegistroForm onSubmit={submit} />
          }

          {/* Aviso: autenticação local (sem backend) */}
          <Box sx={{ mt: '16px', p: '8px 12px', borderRadius: '8px', bgcolor: 'rgba(255,197,0,0.06)', border: '1px solid rgba(255,197,0,0.18)' }}>
            <Typography sx={{ fontSize: 10.5, color: 'rgba(255,197,0,0.75)', lineHeight: 1.55, textAlign: 'center' }}>
              Ambiente de demonstração — autenticação local, sem servidor. Os dados ficam
              apenas neste navegador. Não use sua senha corporativa real.
            </Typography>
          </Box>

          {/* Footer */}
          <Typography sx={{ mt: '18px', fontSize: 11, color: 'rgba(255,255,255,0.16)', textAlign: 'center', letterSpacing: '.3px' }}>
            Acesso restrito ·{' '}
            <Box component="a" href="https://www.linkedin.com/in/raphael-cerri-caveagna/" target="_blank" rel="noopener noreferrer"
              sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'rgba(255,255,255,0.4)' }, transition: 'color .2s' }}>
              by Raphael Cerri Caveagna
            </Box>
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSubmit }: { onSubmit: (nome: string, role: Role) => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [touched, setTouched] = useState({ email: false, senha: false });
  const [error, setError] = useState('');

  const emailValid = EMAIL_RE.test(email);
  const senhaValid = senha.length >= 6;
  const canSubmit = emailValid && senhaValid;

  const handleEmail = (v: string) => setEmail(v.replace(/[^a-zA-Z0-9@._+\-]/g, '').toLowerCase());

  const handleSubmit = async () => {
    setError('');
    const user = findUser(email);
    if (!user) { setError('Usuário não encontrado. Crie uma conta primeiro.'); return; }
    if (!(await checkPassword(user, senha))) { setError('Senha incorreta.'); return; }
    onSubmit(user.name, user.role);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' && canSubmit) handleSubmit(); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <TextField fullWidth placeholder="E-mail" value={email}
        onChange={e => handleEmail(e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        onKeyDown={onKey}
        error={touched.email && !emailValid}
        helperText={touched.email && !emailValid ? 'Use seu e-mail @invent-corp.com' : ''}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.28)' }} /></InputAdornment>, inputProps: { maxLength: 128, inputMode: 'email' as const } } }}
        sx={fieldSx}
      />

      <TextField fullWidth placeholder="Senha" type={showSenha ? 'text' : 'password'} value={senha}
        onChange={e => setSenha(e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, senha: true }))}
        onKeyDown={onKey}
        error={touched.senha && !senhaValid}
        helperText={touched.senha && !senhaValid ? 'Mínimo 6 caracteres' : ''}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.28)' }} /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" tabIndex={-1} onClick={() => setShowSenha(s => !s)}
                  sx={{ color: 'rgba(255,255,255,0.25)', '&:hover': { color: 'rgba(255,255,255,0.55)', bgcolor: 'transparent' } }}>
                  {showSenha ? <VisibilityOffRoundedIcon sx={{ fontSize: 17 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 17 }} />}
                </IconButton>
              </InputAdornment>
            ),
            inputProps: { maxLength: 128 },
          }
        }}
        sx={fieldSx}
      />

      {error && (
        <Typography sx={{ fontSize: 12, color: 'rgba(239,68,68,0.85)', mt: '-4px' }}>
          {error}
        </Typography>
      )}

      <Button fullWidth variant="contained" disabled={!canSubmit} onClick={handleSubmit}
        endIcon={<EastRoundedIcon sx={{ fontSize: '17px !important' }} />}
        sx={{
          mt: '4px', py: '13px', fontSize: 14, fontWeight: 800, letterSpacing: '.3px',
          borderRadius: '11px', bgcolor: '#ffc500', color: '#0a0a0a',
          boxShadow: canSubmit ? '0 0 24px rgba(255,197,0,0.30)' : 'none',
          transition: 'all .22s ease',
          '&:hover': { bgcolor: '#ffd633', boxShadow: '0 0 32px rgba(255,197,0,0.42)', transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
          '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.18)', boxShadow: 'none' },
        }}
      >
        Entrar
      </Button>
    </Box>
  );
}

// ─── Registro Form ────────────────────────────────────────────────────────────
function RegistroForm({ onSubmit }: { onSubmit: (nome: string, role: Role) => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [role, setRole] = useState<Role | ''>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [touched, setTouched] = useState({ nome: false, email: false, senha: false });
  const [error, setError] = useState('');

  const nomeValid = nome.trim().split(/\s+/).filter(Boolean).length >= 2;
  const emailValid = EMAIL_RE.test(email);
  const senhaStrength = getSenhaStrength(senha);
  const senhaValid = senhaStrength >= 2;
  const roleValid = role !== '';
  const canSubmit = nomeValid && emailValid && senhaValid && roleValid && acceptTerms;

  const handleNome = (v: string) => setNome(toTitleCase(v));
  const handleEmail = (v: string) => setEmail(v.replace(/[^a-zA-Z0-9@._+\-]/g, '').toLowerCase());

  const handleSubmit = async () => {
    setError('');
    if (findUser(email)) { setError('E-mail já cadastrado. Faça login.'); return; }
    await createUser(nome.trim(), email, senha, role as Role);
    onSubmit(nome.trim(), role as Role);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' && canSubmit) handleSubmit(); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <TextField fullWidth placeholder="Nome e Sobrenome" value={nome}
        onChange={e => handleNome(e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, nome: true }))}
        onKeyDown={onKey}
        error={touched.nome && !nomeValid}
        helperText={touched.nome && !nomeValid ? 'Nome e Sobrenome' : ''}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.28)' }} /></InputAdornment>, inputProps: { maxLength: 60 } } }}
        sx={fieldSx}
      />

      <TextField fullWidth placeholder="E-mail" value={email}
        onChange={e => handleEmail(e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, email: true }))}
        onKeyDown={onKey}
        error={touched.email && !emailValid}
        helperText={touched.email && !emailValid ? 'Use seu e-mail @invent-corp.com' : ''}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.28)' }} /></InputAdornment>, inputProps: { maxLength: 128, inputMode: 'email' as const } } }}
        sx={fieldSx}
      />

      <TextField fullWidth placeholder="Senha" type={showSenha ? 'text' : 'password'} value={senha}
        onChange={e => setSenha(e.target.value)}
        onBlur={() => setTouched(t => ({ ...t, senha: true }))}
        onKeyDown={onKey}
        error={touched.senha && !senhaValid}
        helperText={touched.senha && !senhaValid ? 'Mínimo 6 caracteres' : ''}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.28)' }} /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" tabIndex={-1} onClick={() => setShowSenha(s => !s)}
                  sx={{ color: 'rgba(255,255,255,0.25)', '&:hover': { color: 'rgba(255,255,255,0.55)', bgcolor: 'transparent' } }}>
                  {showSenha ? <VisibilityOffRoundedIcon sx={{ fontSize: 17 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 17 }} />}
                </IconButton>
              </InputAdornment>
            ),
            inputProps: { maxLength: 128 },
          }
        }}
        sx={fieldSx}
      />

      {/* Strength bar */}
      {senha.length > 0 && (
        <Box sx={{ mt: '-6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {([1,2,3,4] as const).map(level => (
            <Box key={level} sx={{ flex: 1, height: 3, borderRadius: '2px', bgcolor: level <= senhaStrength ? STRENGTH_COLOR[senhaStrength] : 'rgba(255,255,255,0.07)', transition: 'background .25s' }} />
          ))}
          <Typography sx={{ fontSize: 10, color: STRENGTH_COLOR[senhaStrength], ml: '6px', whiteSpace: 'nowrap', transition: 'color .25s' }}>
            {STRENGTH_LABEL[senhaStrength]}
          </Typography>
        </Box>
      )}

      {/* Role select */}
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}>
          <BadgeOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.28)' }} />
        </Box>
        <Select
          fullWidth
          displayEmpty
          value={role}
          onChange={e => setRole(e.target.value as Role)}
          sx={{ ...selectSx, '& .MuiSelect-select': { pl: '42px', py: '13px', fontSize: 14, color: role ? '#fff' : 'rgba(255,255,255,0.28)' } }}
          MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1c28', border: '1px solid rgba(255,255,255,0.1)', '& .MuiMenuItem-root': { fontSize: 13, color: '#e0e0e0', '&:hover': { bgcolor: 'rgba(255,197,0,0.08)' }, '&.Mui-selected': { bgcolor: 'rgba(255,197,0,0.12)', color: '#ffc500' } } } } }}
        >
          <MenuItem value="" disabled sx={{ fontSize: 13, color: 'rgba(255,255,255,0.28) !important' }}>
            Sua função
          </MenuItem>
          {ROLES.map(r => (
            <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Terms */}
      <FormControlLabel
        sx={{ mt: '4px', alignItems: 'flex-start', '& .MuiFormControlLabel-label': { fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, mt: '1px' } }}
        control={
          <Checkbox checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} size="small"
            sx={{ color: 'rgba(255,255,255,0.18)', p: '4px', mr: '6px', mt: '1px', '&.Mui-checked': { color: '#ffc500' }, '& .MuiSvgIcon-root': { fontSize: 17 } }}
          />
        }
        label={<span>Eu li e aceito os <span style={{ color: '#ffc500', fontWeight: 600 }}>Termos e Condições</span> de uso</span>}
      />

      {error && (
        <Typography sx={{ fontSize: 12, color: 'rgba(239,68,68,0.85)', mt: '-4px' }}>
          {error}
        </Typography>
      )}

      <Button fullWidth variant="contained" disabled={!canSubmit} onClick={handleSubmit}
        endIcon={<EastRoundedIcon sx={{ fontSize: '17px !important' }} />}
        sx={{
          py: '13px', fontSize: 14, fontWeight: 800, letterSpacing: '.3px',
          borderRadius: '11px', bgcolor: '#ffc500', color: '#0a0a0a',
          boxShadow: canSubmit ? '0 0 24px rgba(255,197,0,0.30)' : 'none',
          transition: 'all .22s ease',
          '&:hover': { bgcolor: '#ffd633', boxShadow: '0 0 32px rgba(255,197,0,0.42)', transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
          '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.18)', boxShadow: 'none' },
        }}
      >
        Criar conta
      </Button>
    </Box>
  );
}
