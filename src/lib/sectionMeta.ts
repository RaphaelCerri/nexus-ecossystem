export interface SectionMeta {
  id: string;
  n: string;
  t: string;
  phase: string;
}

export const SECTION_META: SectionMeta[] = [
  { id: 'ge', n: '1',   t: 'Info Gerais',         phase: 'Dados do Projeto' },
  { id: 'la', n: '2',   t: 'Layout e Caixas',      phase: 'Dados do Projeto' },
  { id: 'cu', n: '3',   t: 'Cubagem',              phase: 'Dados do Projeto' },
  { id: 'in', n: '4',   t: 'Integração',           phase: 'Dados do Projeto' },
  { id: 'os', n: '5',   t: 'Order Start',          phase: 'Order Start & Picking' },
  { id: 'pb', n: '6',   t: 'PBL / FlowRack',       phase: 'Order Start & Picking' },
  { id: 'ct', n: '7',   t: 'Picking Cart',         phase: 'Order Start & Picking' },
  { id: 'fc', n: '8',   t: 'Full Case',            phase: 'Order Start & Picking' },
  { id: 'pk', n: '9',   t: 'Conferência & Packing', phase: 'Processo de Saída' },
  { id: 'so', n: '10',  t: 'Sorter',               phase: 'Processo de Saída' },
  { id: 'pt', n: '11',  t: 'Palletização & PTL',   phase: 'Processo de Saída' },
  { id: 'es', n: '12',  t: 'Gestão de Estoque',    phase: 'Gestão e Infraestrutura' },
  { id: 'et', n: '13',  t: 'Etiquetas',            phase: 'Gestão e Infraestrutura' },
  { id: 'if', n: '14',  t: 'Infraestrutura',       phase: 'Gestão e Infraestrutura' },
];

export const SECTION_MAP: Record<string, string> = Object.fromEntries(
  SECTION_META.map(s => [s.id, s.t])
);
