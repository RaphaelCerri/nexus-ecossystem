export interface Contact {
  id: string;
  titulo: string;
  email: string;
  phone?: string;
}

export interface Pendencia {
  id: string;
  titulo: string;
  descricao?: string;
  feito: boolean;
}

export interface JsonVersion {
  id: string;
  filename: string;
  content: string; // JSON.stringify of InputJson
  createdAt: string;
}

export interface NexusProject {
  id: string;
  code: string;
  client: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, string>;
  notes: Record<string, string>;
  pblLines: object[];
  osDevices: object[];
  mezDetails: string[];
  etiquetas: object[];
  osDetails?: string[];
  contacts?: Contact[];
  pendencias?: Pendencia[];
  aDefinirNotes?: Record<string, string>;
  progressPct?: number;
  jsonVersions?: JsonVersion[];
  scratchpad?: string;
  meetingNotes?: string;
  sharePointUrl?: string;
}

const KEY = 'nexus_projects_v1';

export function loadProjects(): NexusProject[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function loadProject(id: string): NexusProject | null {
  return loadProjects().find(p => p.id === id) ?? null;
}

export function upsertProject(p: NexusProject): void {
  const all = loadProjects();
  const i = all.findIndex(x => x.id === p.id);
  if (i >= 0) all[i] = p; else all.unshift(p);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteProject(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(loadProjects().filter(p => p.id !== id)));
}

export function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'WCS-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

import { REQUIRED_FIELDS } from './kickoffMeta';

export function getProgress(project: NexusProject): number {
  if (project.progressPct !== undefined) return project.progressPct;
  // fallback for old projects saved before progressPct was added
  const answers = project.answers || {};
  const filled = Object.entries(answers).filter(([k, v]) => REQUIRED_FIELDS.has(k) && v && v !== '' && v !== 'tbd' && !String(v).toLowerCase().includes('definir')).length;
  return Math.min(100, Math.round(filled / REQUIRED_FIELDS.size * 100));
}
