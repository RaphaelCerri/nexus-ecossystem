import JSZip from 'jszip';

// ─── Input types ──────────────────────────────────────────────────────────────

export interface InputMeta {
  projeto: string;
  codinome?: string;  // nome de uso nos documentos (ex: PAYLESS); se ausente usa meta.projeto
  codigo: string;
  fase?: string;
  revisao?: string;
}

export interface InputCapa {
  nome_responsavel?: string;
  email?: string;
  departamento?: string;
  telefone?: string;
  data_revisao?: string;
  descricao_revisao?: string;
  responsavel_revisao?: string;
  nome_cliente?: string;
  data_aprovacao?: string;
}

export type Capitulo =
  | { nivel: 1 | 2 | 3 | 4 | 5; titulo: string; conteudo?: string }
  | { tipo: 'tabela'; headers: string[]; rows: string[][] }
  | { tipo: 'json_block'; linhas: string[] }
  | { tipo: 'warning'; texto: string }
  | { tipo?: string; conteudo?: string; texto?: string };

export interface InputJson {
  meta: InputMeta;
  capa: InputCapa;
  capitulos: Capitulo[];
}

export interface UserInfo {
  name: string;
  email: string;
}

export interface GenerateResult {
  blob: Blob;
  filename: string;
  internalBlocksRemoved: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ANCHOR_START = '{{INICIO_CORPO}}';
const ANCHOR_END   = '{{FIM_CORPO}}';
const INTERNAL_RE  = /\[\s*(OBS\s+INTERNA|ATEN[CÇ][AÃ]O\s+CR[IÍ]TICA)\s*\]/i;
// Conteúdo marcado como "a definir" — seção inteira é omitida do documento
const A_DEFINIR_RE = /^\s*(a\s+definir\.?|pendente\.?|tbd\.?|[-–—]+)\s*$/i;

// ─── XML utilities ────────────────────────────────────────────────────────────

// Caracteres de controle proibidos no XML 1.0 — corrompem o .docx se escaparem.
// eslint-disable-next-line no-control-regex
const XML_INVALID_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

function xe(text: unknown): string {
  return String(text ?? '')
    .replace(XML_INVALID_RE, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function collapseSplitVars(xml: string): string {
  return xml.replace(/\{\{[^{}]{1,60}\}\}/g, (m) => m.replace(/<[^>]+>/g, ''));
}

function replaceVars(xml: string, vars: Record<string, string>): string {
  xml = collapseSplitVars(xml);
  for (const [key, val] of Object.entries(vars)) {
    xml = xml.split('{{' + key + '}}').join(xe(val));
  }
  return xml;
}

// ─── XML builders ─────────────────────────────────────────────────────────────

function xmlHeading(titulo: string, nivel: number): string {
  const n = Math.max(1, Math.min(5, nivel));
  // keepNext: elemento OOXML correto para "manter com próximo parágrafo"
  // spacing before 240 twips = 12 pt antes de qualquer título/subtítulo
  return (
    `<w:p><w:pPr><w:pStyle w:val="Ttulo${n}"/><w:keepNext/>` +
    `<w:spacing w:before="240"/></w:pPr>` +
    `<w:r><w:t xml:space="preserve">${xe(titulo)}</w:t></w:r></w:p>`
  );
}

function xmlBody(texto: string): string {
  const rpr =
    '<w:rPr><w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:cs="Tahoma"/>' +
    '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>';
  const ppr =
    '<w:pPr><w:pStyle w:val="Normal"/><w:jc w:val="left"/>' +
    '<w:spacing w:after="120"/></w:pPr>';
  const runs: string[] = [];
  texto.split('\n').forEach((line, i) => {
    if (i > 0) runs.push('<w:r><w:br/></w:r>');
    if (line.trim())
      runs.push(`<w:r>${rpr}<w:t xml:space="preserve">${xe(line)}</w:t></w:r>`);
  });
  return `<w:p>${ppr}${runs.join('')}</w:p>`;
}

function xmlBodyBold(texto: string): string {
  const rpr =
    '<w:rPr><w:b/><w:bCs/><w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:cs="Tahoma"/>' +
    '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>';
  const ppr =
    '<w:pPr><w:pStyle w:val="Normal"/><w:jc w:val="left"/>' +
    '<w:spacing w:after="120"/></w:pPr>';
  return `<w:p>${ppr}<w:r>${rpr}<w:t xml:space="preserve">${xe(texto)}</w:t></w:r></w:p>`;
}

function xmlCell(
  text: string, width: number,
  fill?: string, bold?: boolean, center?: boolean,
): string {
  const shd  = fill   ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : '';
  const b    = bold   ? '<w:b/><w:bCs/>' : '';
  const jc   = center ? '<w:jc w:val="center"/>' : '<w:jc w:val="left"/>';
  return (
    `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${shd}` +
    `<w:tcMar><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/>` +
    `<w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>` +
    `<w:p><w:pPr><w:spacing w:after="0"/>${jc}</w:pPr>` +
    `<w:r><w:rPr>${b}<w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:cs="Tahoma"/>` +
    `<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>` +
    `<w:t xml:space="preserve">${xe(text)}</w:t></w:r></w:p></w:tc>`
  );
}

// Distribui larguras das colunas proporcionalmente ao conteúdo mais longo de cada coluna.
// Evita que colunas com pouco texto tomem o mesmo espaço que colunas com texto longo.
function calcColumnWidths(headers: string[], rows: string[][]): number[] {
  const ncols = Math.max(1, headers.length || rows[0]?.length || 1);
  const total = 8504;
  if (ncols === 1) return [total];

  const maxLens = Array.from({ length: ncols }, (_, i) => {
    const h = (headers[i] ?? '').length;
    const r = rows.reduce((m, row) => Math.max(m, (row[i] ?? '').length), 0);
    return Math.max(h, r, 4);
  });

  const totalLen = maxLens.reduce((a, b) => a + b, 0);
  const MIN = Math.floor(total * 0.10);

  const raw = maxLens.map(l => Math.floor(total * l / totalLen));
  const clamped = raw.map(w => Math.max(w, MIN));

  const sum = clamped.reduce((a, b) => a + b, 0);
  const out = clamped.map((w, i) =>
    i < clamped.length - 1 ? Math.round(w * total / sum) : 0,
  );
  out[out.length - 1] = total - out.slice(0, -1).reduce((a, b) => a + b, 0);
  return out;
}

function xmlTable(headers: string[], rows: string[][]): string {
  const total  = 8504;
  const widths = calcColumnWidths(headers, rows);

  const grid      = '<w:tblGrid>' + widths.map(w => `<w:gridCol w:w="${w}"/>`).join('') + '</w:tblGrid>';
  const headerRow = '<w:tr>' + headers.map((h, i) => xmlCell(h, widths[i], 'FFC000', true, true)).join('') + '</w:tr>';
  const dataRows  = rows.map(row =>
    '<w:tr>' + row.map((v, i) => xmlCell(String(v ?? ''), widths[i] ?? widths[widths.length - 1])).join('') + '</w:tr>',
  ).join('');

  const tblPr =
    `<w:tblPr><w:tblStyle w:val="Tabelacomgrade"/><w:tblW w:w="${total}" w:type="dxa"/>` +
    `<w:tblBorders>` +
    `<w:top    w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>` +
    `<w:left   w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>` +
    `<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>` +
    `<w:right  w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>` +
    `<w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>` +
    `<w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>` +
    `</w:tblBorders></w:tblPr>`;

  return `<w:tbl>${tblPr}${grid}${headerRow}${dataRows}</w:tbl>`;
}

// JSON syntax highlight — VS Code Dark+ palette
const JSON_TOKEN_RE =
  /(\s+)|("(?:\\.|[^"\\])*"?)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false|null)|([{}\[\],:])|([^\s"{}\[\],:]+)/g;

function jsonRuns(line: string): Array<[string, string]> {
  const re = new RegExp(JSON_TOKEN_RE.source, 'g');
  const runs: Array<[string, string]> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const text = m[0];
    let color: string;
    if      (m[1] !== undefined) { color = 'CCCCCC'; }
    else if (m[2] !== undefined) {
      const rest = line.slice(re.lastIndex).trimStart();
      color = rest.startsWith(':') ? '9CDCFE' : 'CE9178';
    }
    else if (m[3] !== undefined) { color = 'B5CEA8'; }
    else if (m[4] !== undefined) { color = '569CD6'; }
    else                         { color = 'CCCCCC'; }
    runs.push([text, color]);
  }
  return runs;
}

function xmlJsonBlock(linhas: string[]): string {
  const base =
    '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>' +
    '<w:sz w:val="16"/><w:szCs w:val="16"/>';
  return linhas.map(linha => {
    const ppr =
      `<w:pPr><w:shd w:val="clear" w:color="auto" w:fill="1F1F1F"/>` +
      `<w:spacing w:after="0" w:line="210" w:lineRule="atLeast"/>` +
      `<w:jc w:val="left"/><w:rPr>${base}<w:color w:val="CCCCCC"/></w:rPr></w:pPr>`;
    let runs = jsonRuns(linha)
      .map(([t, c]) =>
        `<w:r><w:rPr>${base}<w:color w:val="${c}"/></w:rPr>` +
        `<w:t xml:space="preserve">${xe(t)}</w:t></w:r>`,
      )
      .join('');
    if (!runs)
      runs = `<w:r><w:rPr>${base}<w:color w:val="CCCCCC"/></w:rPr><w:t xml:space="preserve"> </w:t></w:r>`;
    return `<w:p>${ppr}${runs}</w:p>`;
  }).join('');
}

// Rótulo "Exemplo Payload (JSON):" com 6 pt de espaçamento acima e abaixo
function xmlJsonLabel(): string {
  const rpr =
    '<w:rPr><w:b/><w:bCs/><w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:cs="Tahoma"/>' +
    '<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>';
  return (
    `<w:p><w:pPr><w:pStyle w:val="Normal"/><w:jc w:val="left"/>` +
    `<w:spacing w:before="120" w:after="120"/></w:pPr>` +
    `<w:r>${rpr}<w:t>Exemplo Payload (JSON):</w:t></w:r></w:p>`
  );
}

// Parágrafo espaçador vazio (6 pt) — usado entre json_block e tabela
function xmlSpacer(): string {
  return `<w:p><w:pPr><w:spacing w:before="120" w:after="0"/></w:pPr></w:p>`;
}

function xmlWarning(texto: string): string {
  const t = texto.trim().startsWith('!') ? texto.trim() : '! ' + texto.trim();
  return (
    `<w:p><w:pPr><w:ind w:left="360"/>` +
    `<w:shd w:val="clear" w:color="auto" w:fill="FFF3CD"/>` +
    `<w:spacing w:after="120"/>` +
    `<w:jc w:val="left"/>` +
    `<w:rPr><w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:cs="Tahoma"/>` +
    `<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:pPr>` +
    `<w:r><w:rPr><w:b/><w:bCs/>` +
    `<w:rFonts w:ascii="Tahoma" w:hAnsi="Tahoma" w:cs="Tahoma"/>` +
    `<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>` +
    `<w:t xml:space="preserve">${xe(t)}</w:t></w:r></w:p>`
  );
}

function xmlPageBreak(): string {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
}

// Detecta se uma tabela é a tabela de stakeholders/participantes do projeto
function isStakeholdersTable(headers: string[]): boolean {
  const h = headers.join(' ').toLowerCase();
  return (
    h.includes('participante') ||
    h.includes('stakeholder') ||
    (h.includes('função') && h.includes('empresa'))
  );
}

// ─── Body builder ─────────────────────────────────────────────────────────────

// Parágrafo de direção de integração: "Direção: X → Y"
const DIRECTION_RE = /^Dire[cç][aã]o:\s*/i;

// Garante que json_block sempre precede tabela quando aparecem consecutivos
function reorderCapitulos(caps: Capitulo[]): Capitulo[] {
  const out: Capitulo[] = [];
  let i = 0;
  while (i < caps.length) {
    const cur = caps[i] as Record<string, unknown>;
    if (cur.tipo === 'tabela' && i + 1 < caps.length) {
      const nxt = caps[i + 1] as Record<string, unknown>;
      if (nxt.tipo === 'json_block') {
        out.push(caps[i + 1]);
        out.push(caps[i]);
        i += 2;
        continue;
      }
    }
    out.push(caps[i]);
    i++;
  }
  return out;
}

// ─── Estimativa de linhas para quebra de página inteligente ───────────────────
// A4 com margens padrão, Tahoma 10 pt, espaçamento 1.15× + 6 pt after ≈ 36 linhas/página.
// CHARS_PER_LINE: aprox. 85 caracteres em largura útil A4 (170 mm, Tahoma 10 pt).
const PAGE_LINES     = 36;
const CHARS_PER_LINE = 85;
const PAGE_THRESHOLD = 0.70; // inserir quebra quando início > 70 % da página

function estHeadingLines(nivel: number): number {
  if (nivel <= 1) return 3;
  if (nivel === 2) return 2;
  return 1.5;
}

function estCapLines(cap: Capitulo): number {
  const c = cap as Record<string, unknown>;
  const tipo  = c.tipo  as string | undefined;
  const nivel = c.nivel as number | undefined;
  if (nivel != null) {
    const conteudo = String(c.conteudo ?? '').trim();
    const bodyLines = conteudo ? Math.ceil(conteudo.length / CHARS_PER_LINE) : 0;
    return estHeadingLines(nivel) + bodyLines;
  }
  if (tipo === 'tabela') {
    const rows = Array.isArray(c.rows) ? (c.rows as unknown[]).length : 0;
    return 1.5 + rows;
  }
  if (tipo === 'json_block') {
    const linhas = Array.isArray(c.linhas) ? (c.linhas as unknown[]).length : 0;
    return 2 + Math.ceil(linhas * 0.8); // +2: rótulo + espaçador
  }
  if (tipo === 'warning') return 1.5;
  const texto = String(c.conteudo ?? c.texto ?? '');
  return Math.max(1, Math.ceil(texto.length / CHARS_PER_LINE));
}

// Soma estimada de linhas da seção que inicia em fromIndex até o próximo heading
function estSectionLines(caps: Capitulo[], fromIndex: number): number {
  let size = 0;
  for (let j = fromIndex; j < caps.length; j++) {
    const c2 = caps[j] as Record<string, unknown>;
    if (j > fromIndex && c2.nivel != null) break; // para no próximo heading
    size += estCapLines(caps[j]);
  }
  return size;
}

function buildBodyXml(
  capitulos: Capitulo[],
  userInfo?: UserInfo,
): { bodyXml: string; internalsRemoved: string[] } {
  const parts: string[]    = [];
  const internals: string[] = [];
  let lastWarning: string | null = null;

  const ordered = reorderCapitulos(capitulos);

  // totalLines: contador cumulativo de linhas estimadas (módulo PAGE_LINES = posição na página)
  let totalLines = 0;

  for (let i = 0; i < ordered.length; i++) {
    const cap = ordered[i];
    const c   = cap as Record<string, unknown>;
    const nivel = c.nivel as number | undefined;
    const tipo  = c.tipo  as string | undefined;

    if (nivel != null && [1, 2, 3, 4, 5].includes(nivel)) {
      const titulo = String(c.titulo ?? '');
      if (INTERNAL_RE.test(titulo)) { internals.push(titulo); continue; }
      const conteudo = String(c.conteudo ?? '').trim();
      if (A_DEFINIR_RE.test(conteudo)) continue;

      // ── Quebra de página inteligente ────────────────────────────────────────
      const pagePos   = totalLines % PAGE_LINES;
      const remaining = PAGE_LINES - pagePos;
      if (pagePos > PAGE_LINES * PAGE_THRESHOLD) {
        const sectionLines = estSectionLines(ordered, i);
        // Quebra apenas se a seção NÃO cabe no espaço restante da página
        if (sectionLines > remaining) {
          parts.push(xmlPageBreak());
          totalLines = Math.ceil(totalLines / PAGE_LINES) * PAGE_LINES; // avança para próxima página
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      parts.push(xmlHeading(titulo, nivel));
      totalLines += estHeadingLines(nivel);

      if (conteudo) {
        for (const bloco of conteudo.split('\n\n')) {
          const b = bloco.trim();
          if (!b) continue;
          if (INTERNAL_RE.test(b)) { internals.push(b); continue; }
          if (DIRECTION_RE.test(b)) {
            const dir = b.replace(DIRECTION_RE, '').trim();
            if (dir) parts.push(xmlBodyBold(dir));
            totalLines += 1;
            continue;
          }
          parts.push(xmlBody(b));
          totalLines += Math.max(1, Math.ceil(b.length / CHARS_PER_LINE));
        }
      }

    } else if (tipo === 'tabela') {
      const headers = Array.isArray(c.headers) ? (c.headers as unknown[]).map(h => String(h ?? '')) : [];
      const allRows = Array.isArray(c.rows)
        ? (c.rows as unknown[]).filter(Array.isArray).map(r => (r as unknown[]).map(v => String(v ?? '')))
        : [];
      if (headers.some(h => INTERNAL_RE.test(h))) {
        internals.push(headers.join(' | '));
        continue;
      }
      let rows = allRows.filter(r => {
        if (r.some(v => INTERNAL_RE.test(v))) { internals.push(r.join(' | ')); return false; }
        return true;
      });
      if (isStakeholdersTable(headers) && userInfo) {
        rows = [[userInfo.name, 'Analista de negócios', 'Invent Smart'], ...rows];
      }
      if (headers.length || rows.length) {
        parts.push(xmlTable(headers, rows));
        totalLines += 1.5 + rows.length;
      }

    } else if (tipo === 'json_block') {
      const linhas = Array.isArray(c.linhas) ? (c.linhas as unknown[]).map(l => String(l ?? '')) : [];
      if (linhas.some(l => INTERNAL_RE.test(l))) { internals.push(linhas.find(l => INTERNAL_RE.test(l)) ?? ''); continue; }
      if (linhas.length) {
        parts.push(xmlJsonLabel());
        parts.push(xmlJsonBlock(linhas));
        parts.push(xmlSpacer());
        totalLines += 2 + Math.ceil(linhas.length * 0.8);
      }

    } else if (tipo === 'warning') {
      const texto = String(c.texto ?? '').trim();
      if (INTERNAL_RE.test(texto)) { internals.push(texto); continue; }
      if (texto && texto !== lastWarning) {
        parts.push(xmlWarning(texto));
        lastWarning = texto;
        totalLines += 1.5;
      }

    } else {
      const texto = String(c.conteudo ?? c.texto ?? '').trim();
      if (!texto) continue;
      if (INTERNAL_RE.test(texto)) { internals.push(texto); continue; }
      if (DIRECTION_RE.test(texto)) {
        const dir = texto.replace(DIRECTION_RE, '').trim();
        if (dir) parts.push(xmlBodyBold(dir));
        totalLines += 1;
        continue;
      }
      parts.push(xmlBody(texto));
      totalLines += Math.max(1, Math.ceil(texto.length / CHARS_PER_LINE));
    }
  }

  return { bodyXml: parts.join(''), internalsRemoved: [...new Set(internals)] };
}

// ─── Injection ────────────────────────────────────────────────────────────────

function paraBounds(xml: string, marker: string): [number, number] | null {
  const idx = xml.indexOf(marker);
  if (idx === -1) return null;
  const s1    = xml.lastIndexOf('<w:p>', idx);
  const s2    = xml.lastIndexOf('<w:p ', idx);
  const start = Math.max(s1, s2);
  const end   = xml.indexOf('</w:p>', idx);
  if (start === -1 || end === -1) return null;
  return [start, end + '</w:p>'.length];
}

function injectBody(docXml: string, bodyXml: string): string {
  docXml = collapseSplitVars(docXml);
  const ini = paraBounds(docXml, ANCHOR_START);
  const fim = paraBounds(docXml, ANCHOR_END);
  if (!ini || !fim) throw new Error(`Âncoras ${ANCHOR_START}/${ANCHOR_END} não encontradas no template.`);
  if (ini[0] >= fim[0]) throw new Error('Ordem das âncoras inválida no template.');
  return docXml.slice(0, ini[0]) + bodyXml + xmlPageBreak() + docXml.slice(fim[1]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

function safeName(s: string): string {
  const clean = s
    .replace(XML_INVALID_RE, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/^[\s.]+|[\s.]+$/g, '')
    .slice(0, 80)
    .trim();
  return clean;
}

export async function generateDocx(
  templateBytes: ArrayBuffer,
  inputJson: InputJson,
  userInfo?: UserInfo,
): Promise<GenerateResult> {
  const { meta, capa, capitulos } = inputJson;

  // userInfo tem prioridade sobre os campos de capa do JSON
  const fullName  = userInfo?.name  || capa.nome_responsavel  || '';
  const userEmail = userInfo?.email || capa.email             || '';

  // Retorna o valor do campo ou o padrão quando o campo está vazio ou é "[A DEFINIR]"
  const fieldVal = (val: string | undefined, def: string) =>
    (!val || /a\s+definir/i.test(val.trim())) ? def : val;

  const variables: Record<string, string> = {
    NOME_PROJETO:             meta.codinome ?? meta.projeto ?? '',
    CODIGO_PROJETO:           meta.codigo   ?? '',
    FASE:                     meta.fase     ?? 'ES',
    REVISAO:                  meta.revisao  ?? '01',
    NOME_RESPONSAVEL:         fullName,
    EMAIL_RESPONSAVEL:        userEmail,
    DEPARTAMENTO_RESPONSAVEL: fieldVal(capa.departamento, 'Desenvolvimento de Software'),
    TELEFONE_RESPONSAVEL:     fieldVal(capa.telefone,     '+55 11 2833-0005|0006'),
    DATA_REVISAO:             new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    DESCRICAO_REVISAO:        capa.descricao_revisao ?? 'Emissão inicial',
    // Campo responsável na tabela de revisões usa apenas o primeiro nome
    RESPONSAVEL_REVISAO:      firstNameOf(fullName) || capa.responsavel_revisao || '',
    NOME_CLIENTE:             capa.nome_cliente    ?? '',
    DATA_APROVACAO:           capa.data_aprovacao  ?? '',
  };

  const codigo  = safeName(meta.codigo  ?? '') || 'PROJ';
  const projeto = safeName(meta.codinome ?? meta.projeto ?? '') || 'Projeto';
  const rev     = safeName(meta.revisao ?? '') || '01';
  const filename = `${codigo} - ${projeto} - Especificacao de Software - Rev ${rev}.docx`;

  const zip = await JSZip.loadAsync(templateBytes);
  const docFile = zip.file('word/document.xml');
  if (!docFile) throw new Error('Template inválido: word/document.xml não encontrado.');

  let docXml = await docFile.async('string');
  docXml = collapseSplitVars(docXml);
  docXml = replaceVars(docXml, variables);

  // Normaliza a parte do template (antes do corpo injetado): Arial→Tahoma, sz 24→20 e título
  const anchorPos = docXml.indexOf('INICIO_CORPO');
  if (anchorPos !== -1) {
    docXml =
      docXml.slice(0, anchorPos)
        .replace(/w:ascii="Arial"/g, 'w:ascii="Tahoma"')
        .replace(/w:hAnsi="Arial"/g, 'w:hAnsi="Tahoma"')
        .replace(/w:cs="Arial"/g, 'w:cs="Tahoma"')
        .replace(/<w:sz w:val="24"\/>/g, '<w:sz w:val="20"/>')
        .replace(/<w:szCs w:val="24"\/>/g, '<w:szCs w:val="20"/>')
        .replace(/Etapas da ES(?![a-zA-Z])/g, 'Etapas da Especificação de Software (ES)')
      + docXml.slice(anchorPos);
  }

  const { bodyXml, internalsRemoved } = buildBodyXml(capitulos, userInfo);
  docXml = injectBody(docXml, bodyXml);

  zip.file('word/document.xml', docXml);

  // Remove the top-right anchored image (rId2) from header6.xml — it sits on every body page's top-right corner
  const h6file = zip.file('word/header6.xml');
  if (h6file) {
    let h6xml = await h6file.async('string');
    const embedIdx = h6xml.indexOf('r:embed="rId2"');
    if (embedIdx !== -1) {
      // Walk backward to find the actual <w:r> or <w:r ...> start (not <w:rPr>, <w:rFonts>, etc.)
      let runStart = -1;
      const runTagRe = /<w:r[ >]/g;
      let m: RegExpExecArray | null;
      while ((m = runTagRe.exec(h6xml)) !== null) {
        if (m.index < embedIdx) runStart = m.index;
        else break;
      }
      const runEnd = h6xml.indexOf('</w:r>', embedIdx);
      if (runStart !== -1 && runEnd !== -1) {
        h6xml = h6xml.slice(0, runStart) + h6xml.slice(runEnd + 6);
        zip.file('word/header6.xml', h6xml);
      }
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { blob, filename, internalBlocksRemoved: internalsRemoved };
}
