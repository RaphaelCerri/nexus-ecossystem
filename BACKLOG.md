# NEXUS — Backlog de Melhorias

> Documento vivo. Toda nova ideia entra aqui primeiro.
> Após triagem: cada item recebe fase, prioridade e status.
> Atualizado em: 2026-06-11

---

## Legenda

| Símbolo | Significado |
|---|---|
| 🔴 | Alta prioridade — bloqueia ou impacta muito |
| 🟡 | Média prioridade — melhoria relevante |
| 🟢 | Baixa prioridade — nice-to-have |
| 🔧 | Em andamento |
| ✅ | Entregue |
| ❓ | Aguardando esclarecimento |

---

## Fase 1 — Curto prazo (sem backend, melhorias no app atual)

> Tudo que pode ser feito hoje com localStorage, sem mudar a infraestrutura.

| # | Descrição | Prioridade | Status | Observações |
|---|---|---|---|---|
| F1-01 | Nome do cliente e projeto aparecer preenchido no header do kickoff | 🔴 | — | Exibir client + name no topo do formulário aberto |
| F1-02 | Campo "Go-Live" (texto livre) nas Infos Gerais do projeto | 🔴 | — | Data/estimativa de go-live, campo aberto |
| F1-03 | Campo "Layout do Projeto Semelhante ao:" nas Infos Gerais | 🟡 | — | Referência a projeto anterior como base |
| F1-04 | Retirar validação numérica dos campos de quantidade — aceitar texto | 🔴 | — | Ex: "a definir", "2 ou 3 dependendo do cliente" devem ser aceitos |
| F1-05 | IA no kickoff não deve ser pergunta opcional | 🔴 | — | Se o projeto tem IA, deve ser mandatory; revisar gate question |
| F1-06 | Recirculação e IA no Sorter não devem ser perguntas opcionais | 🟡 | — | Mover de opcional para obrigatório dentro da seção Sorter |
| F1-07 | Remover seção Conferência inteira do kickoff | 🔴 | — | Confirmado: conferência não existe nesse tipo de projeto |
| F1-08 | Dependências entre funcionalidades: se tem IA → sempre tem TV e IVT/etiqueta | 🟡 | — | Lógica de campos dependentes — se X=sim, campos Y e Z tornam-se obrigatórios |
| F1-09 | PTM/IA: gerar campos de TV da IA ou TV do PTM e quantidade | 🟡 | ❓ | Ver dúvida C2 abaixo |
| F1-10 | Revisar campos fixos padrão: torná-los invisíveis na UI mas manter no JSON | 🟡 | ❓ | Ver dúvida C3 abaixo |
| F1-11 | Integração mover para o início do formulário | 🟡 | ❓ | Ver dúvida C4 abaixo — decisão estratégica de ordem |
| F1-12 | Notas rápidas (bloco de texto livre) visível no lado esquerdo do kickoff | 🟡 | — | Scratchpad para o preenchedor anotar enquanto digita depois arruma |
| F1-13 | Conta ADM: easter egg (clicar 10x em local secreto + botão Y para acessar) | 🟢 | — | Acesso admin oculto sem tela de login especial |
| F1-14 | KPIs linkados e visíveis na seção Administração do Config | 🟡 | — | Cada feature implementada mostra seus KPIs medidos |
| F1-15 | ADM pode editar os valores de KPI de cada funcionalidade no painel Config | 🟡 | — | Interface para inserir valores reais nas tabelas de KPI |
| F1-16 | Separar "Nome do Projeto" (codinome) de "Nome do Cliente" como campos distintos | 🔴 | — | Atualmente o nome do projeto = nome do cliente. Criar campo codinome; ambos pre-preenchidos no kickoff |
| F1-17 | Texto com "definir" (qualquer case) em qualquer campo → tratado como [A DEFINIR] | 🟡 | — | Validação global no kickoff; complementa o tratamento que já existe no docxBuilder |
| F1-18 | Versionamento de input.json por projeto: accordion no Overview, baixar/excluir/gerar por versão | 🔴 | — | localStorage; visível só para papel `documentacao`; confirmação ao excluir |

---

## Fase 2 — Médio prazo (requer backend Supabase + autenticação real)

> Funcionalidades que dependem de dados na nuvem, multi-usuário ou integrações externas.

| # | Descrição | Prioridade | Status | Observações |
|---|---|---|---|---|
| F2-01 | Login automático se já autenticado naquele navegador (session persistente) | 🔴 | — | Supabase Auth + localStorage token |
| F2-02 | Registro via código enviado por e-mail (magic link / OTP) | 🔴 | — | Login não precisa de código, só o registro |
| F2-03 | Upload de documentos no projeto: Layout Mecânico, Layout Elétrico, Docs aprovados | 🔴 | — | Supabase Storage; vincular ao projeto |
| F2-04 | Link do SharePoint por projeto (campo + abertura direta) | 🟡 | — | Requer banco; campo simples de URL |
| F2-05 | Último Layout Aprovado e Último Documento Aprovado por projeto | 🟡 | — | Requer banco + upload |
| F2-06 | Apontamento de Horas: horário inteligente, associação de cliente, export Excel no formato correto | 🔴 | — | Sub-aba já existe como Coming Soon no módulo Documentação |
| F2-07 | Aba de Relatório — campos a definir — visualizar lacunas do kickoff por projeto | 🟡 | — | Ver dúvida C5 abaixo |
| F2-08 | Alerta de passagem de bastão entre etapas (Doc→Dev→Implantação→Pós-vendas) | 🟡 | ❓ | Ver dúvida C6 abaixo |
| F2-09 | Dividir perguntas do kickoff: GESTOR vs OPERACIONAL (doc, infra, engenharia, etc.) | 🔴 | — | Cada setor complementa o projeto com suas próprias perguntas; JSON unificado |
| F2-10 | Onboarding novo formato: simples, rápido, contextual por papel | 🟡 | — | Substituir intro screen atual por guia interativo |
| F2-11 | Chat por projeto: perguntar sobre um documento vinculado ou o JSON do kickoff daquele projeto | 🔴 | — | Usa Claude API com contexto do projeto específico; ver tokens disponíveis |
| F2-12 | Integração com Claude API pelo usuário (user traz sua própria key) | 🔴 | — | Não aceitar plano gratuito; configurar na tela de config |
| F2-13 | Visibilidade de tokens consumidos em tempo real | 🟡 | — | Contador de tokens na interface durante uso da IA |
| F2-14 | Alternar entre IA gratuita (ex: Gemini Flash) e Claude na interface | 🟡 | — | Fallback para uso sem custo quando não há key |
| F2-15 | Botão "Enviar para revisão" → manda JSON/doc por e-mail para revisor específico | 🟡 | ❓ | Ver dúvida C7 abaixo (quem é "Gomes"?) |
| F2-16 | NEXUS + Especialista Documentador conectados: botão Gerar Doc puxa JSON kickoff + dados de todos setores | 🔴 | — | Unificação total do pipeline de documentação |
| F2-17 | DEV precisa ver pontos de decisão e layout do projeto | 🟡 | ❓ | Ver dúvida C8 abaixo — é uma view/aba ou notificação? |
| F2-18 | RASTREAR e mapear acesso por papel: quais abas, IAs e cards cada papel vê | 🔴 | — | Expansão do featureRegistry para controle granular de UI |
| F2-19 | Cards Situacionais por papel: blocos de info contextuais que aparecem só para quem precisa | 🟡 | ❓ | Ver dúvida C9 abaixo |
| F2-20 | Ao gerar doc: sistema envia JSON do kickoff para Claude, Claude gera input.json, NEXUS monta o .docx e salva no SharePoint | 🔴 | — | Pipeline totalmente automatizado; requer F2-12 + F2-04 |

---

## Fase 3 — Longo prazo (IA avançada, infra própria, expansão)

> Funcionalidades de alto impacto que requerem infraestrutura dedicada, LLM próprio ou expansão para outros setores.

| # | Descrição | Prioridade | Status | Observações |
|---|---|---|---|---|
| F3-01 | IA própria no servidor da empresa (sem depender do Claude) — para uso ilimitado no chat | 🔴 | — | LLM open-source (ex: Llama, Mistral) rodando em servidor dedicado Invent |
| F3-02 | Base de conhecimento vetorial por projeto: "Obsidian que aprende sozinho" | 🔴 | — | Vector DB (ex: Qdrant, Pinecone) alimentado pelos JSONs e docs de cada projeto |
| F3-03 | MD de roteamento: IA identifica quais fontes de conhecimento consultar e economiza tokens | 🟡 | — | Sistema de RAG com routing — IA decide qual especialista MD chamar |
| F3-04 | Sistema de refinamento por peso: IA aprende com os resultados e refina seu próprio MD guia | 🟡 | — | Feedback loop — resultados aprovados aumentam peso de certos padrões |
| F3-05 | Transcript do kickoff → IA preenche o formulário automaticamente | 🔴 | — | Upload de transcript (áudio/texto) → IA preenche → compara com preenchimento humano → aponta divergências |
| F3-06 | Expansão multi-setor: PMO (dashboards KPI), Implantação (IAs de suporte técnico), Pós-vendas (alertas) | 🔴 | — | Cada setor com suas perguntas específicas no projeto, todas alimentando a IA |
| F3-07 | Intensivão por setor: mapear processos, identificar planilhas existentes e migrar para NEXUS com IAs | 🟡 | — | Processo de adoção — entrevista setor, mapeia dor, constrói módulo |
| F3-08 | Transformar planilhas de controle de cada setor em CRUDs dentro do NEXUS | 🟡 | — | Conectados à IA específica daquele setor |
| F3-09 | MCP Server: expor dados do NEXUS como ferramentas para IAs externas | 🟡 | — | `get_project(code)`, `list_projects()`, `search_projects(query)` |
| F3-10 | Domínio próprio: nexus.invent.com.br | 🟡 | — | Requer Netlify/VPS + configuração DNS |
| F3-11 | Edição colaborativa em tempo real (Supabase Realtime) | 🟢 | — | Múltiplos usuários editando o mesmo projeto simultaneamente |

---

## Aguardando esclarecimento

Preciso das suas respostas para fechar a triagem desses itens:

| # | Dúvida | Item relacionado |
|---|---|---|
| C1 | ~~"CONFERÊNCIA não tem"~~ — **Resolvido:** remover a seção inteira. | F1-07 |
| C2 | "PTM/IA televisão" — o que é "televisão" nesse contexto? É uma tela/display físico que fica na estação? O campo seria "Quantidade de TVs da IA" e "Quantidade de TVs do PTM"? | F1-09 |
| C3 | "Campos fixos padrão invisíveis" — quais campos você tem em mente? Ex: campos que sempre têm o mesmo valor e não precisam aparecer no form mas devem ir no JSON? | F1-10 |
| C4 | Integração no início — é mover a seção de Integração (ERP, APIs) para antes das outras no formulário, ou é criar um campo de integração nas Infos Gerais como contexto inicial? | F1-11 |
| C5 | Aba de Relatório — o que aparece lá? Ex: "campos que ninguém preencheu essa semana", "projetos com mais TBDs", "seções com menor taxa de completude"? | F2-07 |
| C6 | Passagem de bastão — quais são as etapas exatas? A sequência é: Kickoff → Documentação → Dev → Implantação → Pós-vendas? E o alerta vai para quem exatamente em cada etapa? | F2-08 |
| C7 | "Botão enviar pro Gomes" — Gomes é uma pessoa específica da empresa com um processo de revisão? O botão seria configurável (qualquer e-mail de revisor) ou fixo para ele? | F2-15 |
| C8 | "DEV precisa saber pontos de decisão e layout" — é uma view específica para o papel Desenvolvimento dentro do projeto, mostrando só o que é relevante pra eles (decisões técnicas, layouts)? | F2-17 |
| C9 | "Cards Situacionais" — pode me dar um exemplo concreto? Ex: PMO vê um card de "Projetos atrasados esta semana", Implantação vê um card de "Checklist de comissionamento", etc? | F2-19 |

---

## Histórico — Entregue

| Versão | Feature | Data |
|---|---|---|
| v1.0 | Formulário Kickoff WCS — 15 seções completas | 2024 |
| v1.0 | Auto-save + localStorage | 2024 |
| v1.0 | Exportação JSON + Markdown | 2024 |
| v1.0 | Gestão de contatos por projeto | 2024 |
| v1.0 | Gate questions + progresso por seção | 2024 |
| v1.0 | PBL com múltiplas linhas | 2024 |
| v1.0 | Editor de etiquetas dinâmico | 2024 |
| v1.0 | Pendências (TBDs + tarefas manuais) | 2024 |
| v1.0 | Página de Projetos com busca | 2024 |
| v1.0 | Project Overview + contatos | 2024 |
| v1.0 | Sidebar colapsável + seletor de papel | 2024 |
| v1.0 | Busca global no kickoff | 2024 |
| v1.0 | Painel "A Definir" colapsável | 2024 |
| v1.2 | Módulo Documentação — aba exclusiva por papel | 2026-06-10 |
| v1.2 | Gerar Documento .docx no browser sem Python (docxBuilder.ts + JSZip) | 2026-06-10 |
