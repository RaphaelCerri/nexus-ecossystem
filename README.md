# NEXUS — Plataforma de Gestão de Projetos WCS

> Sistema interno da **Invent** para digitalizar, padronizar e acelerar o ciclo completo de implantação de projetos WCS — do kickoff inicial até a geração automática da Especificação de Software.

---

## O problema que resolve

Antes do NEXUS, cada kickoff era um caos controlado: planilhas Excel, anotações manuais, e-mails avulsos e 2–3 reuniões extras só para alinhar informações que poderiam ter sido capturadas na primeira conversa. A documentação técnica levava horas para ser montada manualmente a cada projeto.

Hoje: o gestor abre o NEXUS, preenche o formulário estruturado uma vez, exporta o JSON — e 80% da Especificação de Software se escreve sozinha.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript |
| UI | Material UI v9 (tema dark + amarelo Invent) |
| Build | Vite 8 |
| Dados | `localStorage` (Supabase planejado para Fase 1) |
| Geração de documentos | JSZip (manipulação de .docx 100% no browser) |
| Hosting planejado | Netlify |

Sem backend por enquanto — 100% client-side.

---

## Módulos

### Kickoff WCS `v1.0`

Formulário estruturado com **15 seções** cobrindo todo o ciclo de um projeto WCS:

| # | Seção | Descrição |
|---|---|---|
| 1 | Info Gerais | Código, cliente, codinome, responsáveis |
| 2 | Layout | Dimensões, mezanino com detalhamento por nível |
| 3 | Cubagem | Volumes, UMs, características de produto |
| 4 | Order Start | Estações, dispositivos, configurações individuais |
| 5 | PBL / FlowRack | Múltiplas linhas independentes com configuração individual |
| 6 | Picking Cart | Tipo, capacidade, integração |
| 7 | Full Case | Picking de caixa fechada, paletes |
| 8 | Gestão de Estoque | Endereçamento, inventário, regras de negócio |
| 9 | Sorter | Modelo, capacidade, destinos |
| 10 | Conferência | Stations, balanças, controle de qualidade |
| 11 | Packing | Estações de embalagem, etiquetagem de saída |
| 12 | PTL / PTM | Pick-to-light e put-to-light |
| 13 | Etiquetas | Editor dinâmico com campos configuráveis e código de barras |
| 14 | Integração | ERP, APIs, protocolos, mapeamento de mensagens |
| 15 | Infraestrutura | Servidores, rede, acesso remoto |

**Destaques:**
- **Gate questions** — "Não tem Sorter?" → seção inteira marcada 100% e ocultada automaticamente
- **Auto-save** com debounce de 1s — nenhum dado perdido
- **Progresso em tempo real** — barra por seção e porcentagem geral
- **Painel "A Definir"** — lista clicável de todos os campos TBD com navegação direta
- **Busca global** — encontra qualquer pergunta no formulário em segundos
- **Exportação** em JSON estruturado e Markdown formatado
- **Gestão de contatos** por projeto com cópia de lista de e-mails em um clique
- **Pendências** — TBDs automáticos + tarefas manuais por projeto

---

### Documentação `v1.2`

Módulo exclusivo para o papel **Documentação**. Aparece na sidebar apenas para quem tem esse papel atribuído.

#### Pipeline completo

```
Gestor preenche o Kickoff no NEXUS
             ↓
       Exporta o JSON
             ↓
  Especialista Documentador
  alimenta a IA com o JSON
             ↓
      Gera o input.json
             ↓
  Upload do input.json no NEXUS
  + seleção do projeto vinculado
             ↓
   Clique em "Gerar e Baixar"
             ↓
  .docx gerado no browser e
  baixado automaticamente —
  sem Python, sem servidor
```

#### Sub-abas

| Sub-aba | Status |
|---|---|
| Gerar Documento | ✅ Implementado |
| Apontamento de Horas | 🔧 Em desenvolvimento |

#### Gerar Documento

**Fluxo:**
1. Seleciona o projeto existente no NEXUS
2. Faz upload do `input.json` gerado pelo Especialista Documentador
3. Clica em "Gerar e Baixar" — o `.docx` é montado via JSZip no browser e baixado automaticamente

**Nome do arquivo gerado:**
```
{CODIGO} - {PROJETO} - Especificacao de Software - Rev {REVISAO}.docx
```

**O que o motor preserva do template Invent:**
- Capa (páginas 1–2) com logotipo, dados do projeto e responsável
- Cabeçalho e rodapé com logo + régua amarela em todas as páginas
- Página de Aprovação da Proposta ao final

**O que é gerado a partir do `input.json`:**
- Títulos com numeração automática por estilo (níveis 1–5)
- Parágrafos de corpo (Arial 12pt, justificado)
- Tabelas no padrão Invent (cabeçalho amarelo FFC000, bordas CCCCCC)
- Blocos de código JSON com syntax highlight estilo VS Code Dark+
- Callouts de aviso (fundo amarelo claro, prefixo `!`)
- **Filtro anti-vazamento** — blocos com `[OBS INTERNA]` ou `[ATENÇÃO CRÍTICA]` são removidos automaticamente antes de gerar o documento do cliente

---

## Sistema de papéis

| Papel | Acesso |
|---|---|
| `gestao` | Kickoff, Projetos, Dashboard, Ferramentas I.A, Sugestões |
| `engenharia` | Kickoff, Projetos, Sugestões |
| `pmo` | Kickoff, Projetos + painel de controle *(em breve)* |
| `documentacao` | Kickoff, Projetos + **aba Documentação** |
| `desenvolvimento` | Kickoff, Projetos, Sugestões |
| `eletrica` | Kickoff, Projetos, Sugestões |

Funcionalidades exclusivas por papel são registradas em `src/lib/featureRegistry.ts` e aparecem automaticamente em **Configurações → Administração** — sem precisar alterar a UI.

---

## Estrutura de arquivos

```
nexus/
├── public/
│   ├── nexus-logo.png
│   ├── nexus-icon.png
│   └── ES_PLACEHOLDER_v6.docx        # template do documento Invent (asset estático)
│
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx               # navegação + seletor de papel
│   │   ├── ProjectPickerModal.tsx    # busca e seleção de projeto existente
│   │   └── NewKickoffModal.tsx       # criação de novo projeto
│   │
│   ├── pages/
│   │   ├── Projetos/                 # listagem, visão geral e pendências
│   │   ├── KickoffPage/              # formulário completo (15 seções)
│   │   ├── Documentacao/
│   │   │   ├── index.tsx             # sub-abas da aba Documentação
│   │   │   └── GerarDocumento.tsx    # upload + geração do .docx
│   │   ├── ConfigPage/               # configurações + administração de papéis
│   │   └── SugestoesPage/            # canal de sugestões interno
│   │
│   └── lib/
│       ├── projectStore.ts           # CRUD de projetos no localStorage
│       ├── featureRegistry.ts        # registro de funcionalidades por papel
│       └── docxBuilder.ts            # motor de geração de .docx (port do Python)
│
└── ed-knowledge/
    ├── build_docx_v5.py              # script Python original (referência canônica)
    ├── ES_PLACEHOLDER_v6.docx        # template original
    └── input.json                    # exemplo de input para o gerador
```

---

## Como rodar

```bash
# Instala as dependências
npm install

# Sobe o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`.

**Login:** qualquer nome (2+ chars) + e-mail válido + senha (6+ chars). A autenticação é fake enquanto não há backend — qualquer credencial válida entra.

---

## Formato do `input.json`

```json
{
  "meta": {
    "projeto":  "Nome do Projeto",
    "codigo":   "I25.0001",
    "fase":     "ES",
    "revisao":  "01"
  },
  "capa": {
    "nome_responsavel":    "Fulano de Tal",
    "email":               "fulano@invent-corp.com",
    "departamento":        "Engenharia de Software",
    "telefone":            "+55 11 2833-0005",
    "data_revisao":        "10/06/2026",
    "descricao_revisao":   "Emissão inicial",
    "responsavel_revisao": "Fulano de Tal",
    "nome_cliente":        "Empresa Cliente S.A.",
    "data_aprovacao":      "10/06/2026"
  },
  "capitulos": [
    { "nivel": 1, "titulo": "Objetivo do documento", "conteudo": "Descreva o propósito aqui." },
    { "nivel": 2, "titulo": "Escopo", "conteudo": "Delimite o escopo do projeto." },
    {
      "tipo": "tabela",
      "headers": ["Campo", "Tipo", "Obrigatório", "Exemplo", "Descrição"],
      "rows": [
        ["nroPedido", "string", "Sim", "SP-001", "Número do pedido de separação"]
      ]
    },
    {
      "tipo": "json_block",
      "linhas": ["{", "  \"nroPedido\": \"SP-001\",", "  \"qtde\": 547204", "}"]
    },
    {
      "tipo": "warning",
      "texto": "Esta etapa depende de validação do cliente antes de prosseguir."
    }
  ]
}
```

> Blocos com `[OBS INTERNA]` ou `[ATENÇÃO CRÍTICA]` no campo `conteudo` ou `texto` são filtrados automaticamente e nunca aparecem no documento entregue ao cliente.

---

## Roadmap

| Versão | Módulo | Status |
|---|---|---|
| **v1.0** | Kickoff WCS completo — 25 features | ✅ Produção |
| **v1.2** | Módulo Documentação — Gerar Documento no browser | ✅ Produção |
| **v1.3** | Módulo Documentação — Apontamento de Horas | 🔧 Em desenvolvimento |
| **v2** | Dashboard — métricas, timeline, taxas de completude | 📋 Planejado |
| **v3** | Backend Supabase — projetos na nuvem, multi-usuário | 📋 Planejado |
| **v4** | Auth real — login e-mail/senha, RLS por papel | 📋 Planejado |
| **v5** | Claude API — geração de 80% da ES via IA | 📋 Planejado |
| **v6** | MCP Server — dados NEXUS como ferramentas de IA | 📋 Planejado |

---

## Registro de features

O histórico completo de features entregues, KPIs mapeados e hipóteses de impacto está documentado em [`NEXUS_FEATURES.md`](NEXUS_FEATURES.md).

**Resumo atual:** 27 features entregues · 39 KPIs mapeados

---

*Desenvolvido por **Raphael Cerri Caveagna** · Invent Corp*
