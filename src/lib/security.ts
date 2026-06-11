// Utilitários centralizados de segurança para parsing e validação de uploads.

/** Limite de tamanho para uploads de JSON (protege contra DoS por arquivo gigante). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * JSON.parse com reviver que descarta chaves perigosas (__proto__, constructor,
 * prototype), prevenindo prototype pollution quando o objeto é mesclado/copiado.
 */
export function safeJsonParse(text: string): unknown {
  return JSON.parse(text, function (key, value) {
    if (DANGEROUS_KEYS.has(key)) return undefined;
    return value;
  });
}

export function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key);
}

/** Lê um File como texto, rejeitando acima de MAX_UPLOAD_BYTES. */
export function readUploadAsText(file: File, maxBytes: number = MAX_UPLOAD_BYTES): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Limite: ${Math.round(maxBytes / 1024 / 1024)} MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => resolve(String(ev.target?.result ?? ''));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsText(file, 'utf-8');
  });
}

// ─── Validação de schema do input.json (Gerar Documento) ─────────────────────

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const MAX_CAPITULOS = 5000;
const MAX_TABLE_ROWS = 2000;
const MAX_JSON_LINES = 5000;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(x => typeof x === 'string');
}

/**
 * Valida a estrutura do input.json antes da geração do .docx.
 * Retorna erros legíveis para o usuário em vez de quebrar no meio da geração.
 */
export function validateInputJson(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(data)) return { ok: false, errors: ['O arquivo não contém um objeto JSON válido.'] };

  const meta = data.meta;
  if (!isPlainObject(meta)) {
    errors.push('Campo "meta" ausente ou inválido (deve ser um objeto).');
  } else {
    if (typeof meta.projeto !== 'string' || !meta.projeto.trim()) errors.push('Campo "meta.projeto" é obrigatório (string).');
    if (typeof meta.codigo !== 'string' || !meta.codigo.trim()) errors.push('Campo "meta.codigo" é obrigatório (string).');
    if (meta.fase !== undefined && typeof meta.fase !== 'string') errors.push('Campo "meta.fase" deve ser string.');
    if (meta.revisao !== undefined && typeof meta.revisao !== 'string') errors.push('Campo "meta.revisao" deve ser string.');
  }

  if (data.capa !== undefined && !isPlainObject(data.capa)) {
    errors.push('Campo "capa" deve ser um objeto.');
  } else if (isPlainObject(data.capa)) {
    for (const [k, v] of Object.entries(data.capa)) {
      if (v !== undefined && typeof v !== 'string') errors.push(`Campo "capa.${k}" deve ser string.`);
    }
  }

  const capitulos = data.capitulos;
  if (!Array.isArray(capitulos)) {
    errors.push('Campo "capitulos" ausente ou inválido (deve ser uma lista).');
  } else {
    if (capitulos.length > MAX_CAPITULOS) errors.push(`Lista "capitulos" excede o limite de ${MAX_CAPITULOS} itens.`);
    capitulos.forEach((cap, i) => {
      const where = `capitulos[${i}]`;
      if (!isPlainObject(cap)) { errors.push(`${where}: deve ser um objeto.`); return; }
      if (cap.tipo === 'tabela') {
        if (!isStringArray(cap.headers)) errors.push(`${where}: "headers" deve ser uma lista de strings.`);
        if (!Array.isArray(cap.rows) || !cap.rows.every(r => isStringArray(r))) errors.push(`${where}: "rows" deve ser uma lista de listas de strings.`);
        else if (cap.rows.length > MAX_TABLE_ROWS) errors.push(`${where}: tabela excede ${MAX_TABLE_ROWS} linhas.`);
      } else if (cap.tipo === 'json_block') {
        if (!isStringArray(cap.linhas)) errors.push(`${where}: "linhas" deve ser uma lista de strings.`);
        else if (cap.linhas.length > MAX_JSON_LINES) errors.push(`${where}: bloco JSON excede ${MAX_JSON_LINES} linhas.`);
      } else if (cap.tipo === 'warning') {
        if (typeof cap.texto !== 'string') errors.push(`${where}: "texto" deve ser string.`);
      } else if (cap.nivel !== undefined) {
        if (typeof cap.nivel !== 'number' || ![1, 2, 3, 4, 5].includes(cap.nivel)) errors.push(`${where}: "nivel" deve ser 1–5.`);
        if (typeof cap.titulo !== 'string') errors.push(`${where}: "titulo" deve ser string.`);
        if (cap.conteudo !== undefined && typeof cap.conteudo !== 'string') errors.push(`${where}: "conteudo" deve ser string.`);
      } else if (cap.conteudo !== undefined && typeof cap.conteudo !== 'string') {
        errors.push(`${where}: "conteudo" deve ser string.`);
      } else if (cap.texto !== undefined && typeof cap.texto !== 'string') {
        errors.push(`${where}: "texto" deve ser string.`);
      }
    });
  }

  return { ok: errors.length === 0, errors };
}
