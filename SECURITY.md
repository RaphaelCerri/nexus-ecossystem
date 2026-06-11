# Segurança — NEXUS

> Última auditoria: 11/06/2026 (auditoria automatizada de código + correções).
> Este documento registra o modelo de ameaças atual, os riscos conhecidos e o
> checklist obrigatório antes de qualquer deploy com dados reais.

## Modelo de ameaças atual

O NEXUS é hoje **100% client-side, sem backend**. Isso define o teto de segurança:

- **Não existe autenticação real.** O login/registro local (com hash PBKDF2 de senha)
  é apenas UX — qualquer pessoa com acesso ao navegador/DevTools entra e lê tudo.
- **Não existe autorização real.** Papéis (`gestao`, `documentacao`, etc.) são estado
  de UI. O seletor de papel na sidebar permite trocar de papel livremente. A aba
  Documentação não é um perímetro de segurança.
- **Todos os dados ficam em `localStorage`**, em texto legível: projetos, clientes,
  contatos (nomes, e-mails), pendências, sugestões. Em máquina compartilhada,
  qualquer usuário do mesmo perfil do SO lê esses dados.
- **`localStorage` não é limpo no logout** (por design — os dados são "o banco").
  Isso significa que logout NÃO protege os dados em máquina compartilhada.

**Conclusão: não publicar com dados reais de clientes até a Fase Supabase + Auth + RLS.**

## Proteções já implementadas no código

| Proteção | Onde |
|---|---|
| Senhas com hash PBKDF2-SHA256 (100k iterações) + salt; migração automática de contas legadas; nunca texto puro | `src/lib/passwordHash.ts`, `src/pages/LoginPage.tsx` |
| Filtro anti-vazamento (`[OBS INTERNA]` / `[ATENÇÃO CRÍTICA]`) cobre parágrafos, **títulos, tabelas (células/cabeçalhos) e blocos JSON** | `src/lib/docxBuilder.ts` |
| Contador de blocos internos removidos exibido após gerar o documento | `src/pages/Documentacao/GerarDocumento.tsx` |
| Escape XML completo + remoção de caracteres de controle inválidos (evita .docx corrompido/injeção em XML) | `src/lib/docxBuilder.ts` (`xe`, `XML_INVALID_RE`) |
| Sanitização do nome de arquivo gerado (caracteres reservados, pontos nas bordas, limite de 80 chars) | `src/lib/docxBuilder.ts` (`safeName`) |
| Limite de 10 MB + validação de schema com erros legíveis nos uploads de JSON | `src/lib/security.ts`, `GerarDocumento.tsx`, `NewKickoffModal.tsx` |
| Proteção contra prototype pollution (`__proto__`, `constructor`, `prototype` descartados no parse e na mesclagem) | `src/lib/security.ts` |
| Headers de segurança no deploy Netlify (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP) | `public/_headers` |
| Aviso visual de autenticação local/demonstração na tela de login | `src/pages/LoginPage.tsx` |
| Sessão persistida sincronizada ao trocar papel na sidebar | `src/App.tsx` |

## Riscos conhecidos e aceitos (até o backend)

1. **Papéis manipuláveis** — qualquer usuário acessa qualquer aba via DevTools ou pelo
   próprio seletor de papel. Aceito enquanto o app for interno e sem dados sensíveis.
2. **Dados em texto legível no `localStorage`** — sem isolamento por usuário.
3. **Template `.docx` público** — `/ES_PLACEHOLDER_v6.docx` é baixável por qualquer
   pessoa com acesso à URL do site. Não colocar conteúdo sensível no template.
4. **Hash client-side não impede ataque offline** — quem copiar o `localStorage` pode
   fazer brute-force do hash localmente. É mitigação, não autenticação.
5. **Filtro anti-vazamento depende de marcador textual** — conteúdo interno SEM o
   marcador `[OBS INTERNA]`/`[ATENÇÃO CRÍTICA]` não é detectado. O processo (IA que
   gera o input.json) precisa garantir a marcação.

## Checklist antes de publicar em produção

- [ ] Auth real implementada (Supabase Auth ou equivalente)
- [ ] RLS configurado e testado por usuário/papel/projeto
- [ ] Permissões deixam de confiar no client-side (papel vem do token, não do localStorage)
- [ ] Dados sensíveis fora do `localStorage` (migrados para o banco)
- [ ] Política de retenção/limpeza de dados locais definida (incluindo logout)
- [ ] Headers de segurança ativos no Netlify (`public/_headers` chegou ao deploy — verificar com `curl -I`)
- [ ] CSP validada no console do browser (sem violações nos fluxos principais)
- [ ] Source maps desabilitados ou protegidos em produção (Vite default: desabilitado)
- [ ] Upload validado por schema/tamanho (feito — revalidar após mudanças no formato)
- [ ] Filtro anti-vazamento testado contra bypass (tabelas, json_block, títulos — coberto; retestar a cada novo tipo de bloco)
- [ ] Build sem erros + lint limpo
- [ ] Revisão manual dos fluxos: criar projeto, kickoff, auto-save, exports, upload, gerar .docx, trocar papel, logout

## Checklist de migração Supabase / Auth / RLS (Fases v3–v4)

1. Modelar tabelas com `owner_id`/`org_id` desde o início; nunca tabela sem RLS.
2. Habilitar RLS em TODAS as tabelas (`alter table ... enable row level security`).
3. Políticas por papel via claims do JWT (papel atribuído por admin, nunca auto-declarado no registro).
4. Remover o seletor de papel da sidebar (ou restringi-lo a admins) quando o papel vier do token.
5. Migrar `nexus_users` → Supabase Auth; descartar hashes locais (forçar redefinição de senha).
6. Migrar `nexus_projects_v1`, `nexus_sugestoes`, `nexus_lista`, `nexus_features` com script de import único; depois limpar o `localStorage`.
7. Chaves `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` em variáveis de ambiente do Netlify (a anon key é pública por design; a `service_role` NUNCA no front).
8. Adicionar `connect-src https://*.supabase.co wss://*.supabase.co` à CSP em `public/_headers`.
9. Logs/monitoramento: ativar logs do Supabase e alertas de erro no front (ex.: Sentry) sem capturar PII.
