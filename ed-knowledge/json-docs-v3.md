# Documentação de Campos — JSON Checklist Kickoff WCS v3.0

> Este documento serve como dicionário de dados para o JSON exportado pela aplicação Checklist Kickoff WCS.
> Use-o como contexto ao alimentar o JSON em qualquer IA ou sistema externo.
>
> **Changelog v3.2 — Duplo gate na seção pk (cf_gate + pk1):**
> - **Seção `pk`:** adicionado `cf_gate` ("Tem Conferência?") como gate da sub-seção de conferência. Campos `cf_t1`, `cf2`, `cf_t2`, `cf4` agora só aparecem quando `cf_gate = "yes"`. Se `cf_gate = "no"` **e** `pk1 = "no"`, a seção inteira fica inativa ("escura").
>
> **Changelog v3.1 — Gate questions seletivas + Conferência & Packing + ajustes Info Gerais:**
> - **Seção `ge`:** `g5` renomeado para "Sistema do Cliente" (agora abrange WMS/EWM/SAP/outros); `g6` (ERP) removido; `g_obs` removido; `g_golive` agora obrigatório.
> - **Gate questions adicionadas** (apenas nas seções em que fazem sentido): `os_gate` (Order Start), `pt_gate` (Palletização & PTL). Seções `la`, `in`, `et`, `if` **não têm gate** — são sempre obrigatórias.
> - **Seção `pk` renomeada para "Conferência & Packing":** campos `cf_t1`, `cf2`, `cf_t2`, `cf4` (antes seção independente `cf`) integrados à seção `pk`. A seção `cf` foi removida como section key separada — todos os campos ficam em `sections.pk`.
> - **Seção `in`:** `in_resp` removido; `in1` ganhou opção `"tbd"`.
> - **Numeração sequencial 1–14:** seções `pb`=6, `ct`=7, `fc`=8, `pk`=9, `so`=10, `pt`=11, `es`=12, `et`=13, `if`=14 (removidas sub-numerações 6a/6b/6c).

> **Changelog v3.0 — Refatoração completa do modelo de dados:**
> - `meta.v` atualizado para `"4.0"`.
> - **IDs de seção encurtados:** `geral`→`ge`, `layout`→`la`, `cubagem`→`cu`, `orderstart`→`os`, `pbl`→`pb`, `cart`→`ct`, `fullcase`→`fc`, `conferencia`→`cf`, `packing`→`pk`, `sorter`→`so`, `ptl`→`pt`, `estoque`→`es`, `etiquetas`→`et`, `integracao`→`in`, `infra`→`if`.
> - **Seções removidas:** `pickextra` (pe1–pe6), `shortpick` standalone (sp*), `dashboards` (db1–db5).
> - **Seção `ge` (geral):** adicionados `g_codinome`, `g4a` (escopo aditivo), `g_golive`, `g_obs`; removidos `g7` (multi-empresa), `g8`, `g9` (gestão estoque sombra).
> - **Seção `la` (layout):** `l2` renomeado para `l_esteira`; removidos `l4` (zonas) e `l7` (multi-tamanho caixa).
> - **Seção `cu` (cubagem):** adicionados gate `cu1` e `c2a`; removidos `c3`, `c4`, `c5`.
> - **Seção `os` (orderstart):** adicionados `os_r` e `os_imp_etq`; removidos `os2`, `os3`, `os6`, `os7`.
> - **Seção `pb` (pbl):** adicionados `pk_tp` e `pk_es`. PBL reestruturado: perguntas por linha de FlowRack ficam em `pbl_lines[]` no nível raiz.
> - **Seção `ct` (cart):** adicionados `ct_r`, `ct_qc`, `ct_d`, `ct_df`, `s1c`, `s2c`; removidos `ct3`, `ct4`, `ct5`.
> - **Seção `fc` (fullcase):** adicionados `fc_r`, `fc2b`, `fc_i`, `fc_if`, `fc_re`, `fc_qe`; removidos `fc3`, `fc4`, `fc5`, `fc6`.
> - **Seção `cf` (conferencia):** `cf1` substituído por `cf_t1` (multi); adicionado `cf_t2`; removidos `cf3`, `cf5`, `cf6`, `cf7`.
> - **Seção `pk` (packing):** adicionados `pk_auto`, `pk_imp`, `pk_imp_f`, `pk_imp_t`, `pk_etiq`; `pk3` renomeado para `pk_troca`; removidos `pk2`, `pk4`.
> - **Seção `so` (sorter):** adicionados `st_cap`, `st_criterio`, `st_ag`; `st_recirc` renomeado para `st_rc`; removidos `st8`, `st9`.
> - **Seção `pt` (palletizacao & ptl):** adicionados `pt_frag` (Matriz de Fragilidade, antes `es9`), `pt_ag`, `pt_tem_ptl`, `pt_tipo_disp`, `pt_tvs_ptl`, `pt_ptm`, `pt_ptm_qtd`; removidos `pt2`, `pt4`, `pt5`, `pt6`, `pt7`.
> - **Seção `es` (estoque):** `es9` movido para `pt_frag`; `es10` agora é "Double check" (verificação dupla na expedição).
> - **Seção `et` (etiquetas):** adicionados `et_r` e `et_dist`; removidos `et2`, `et3`, `et4`, `et5`.
> - **Seção `in` (integracao):** `in2` renomeado para `in_resp`; adicionado `in_endpoint`.
> - **Seção `if` (infra):** adicionados `if_titul`, `if_ambiente`, `if_s`, `if_ambientes`, `if_focal`, `if_data_infra`; removidos `if11`–`if14`.

---

## Estrutura do JSON

```json
{
  "meta": {
    "project": "Nome do projeto",
    "date": "2026-06-10T14:00:00.000Z",
    "v": "4.0",
    "total_pct": 82,
    "filled": 47
  },
  "sections": {
    "ge": { "g1": "...", "g2": "..." },
    "la": { "l1": "plastic", "l3": "yes" },
    "cu": { "cu1": "yes", "c1": "wcs" },
    "os": { "os_r": "wcs", "os1": "2" },
    "pb": { "p1": "yes", "pk_tp": "3000" },
    "ct": { "ct1": "no" },
    "fc": { "fc1": "yes", "fc_r": "wcs" },
    "cf": { "cf_t1": "conf_blind|||conf_ean", "cf2": "12" },
    "pk": { "pk1": "yes", "pk_troca": "yes" },
    "so": { "st1": "yes", "st2": "20", "st_rc": "yes" },
    "pt": { "pt1": "ptl_opt", "pt3": "168", "pt_frag": "yes" },
    "es": { "es1": "yes", "es2": "yes", "es10": "yes" },
    "et": { "et_r": "wcs", "et1": "5" },
    "in": { "in1": "rest" },
    "if": { "if_titul": "srv_client", "if1": "win", "if2": "mssql" }
  },
  "pbl_lines": [
    { "p_r": "wcs", "p_m": "led_mode", "p_led": "led3", "p2": "8" }
  ],
  "notes": { "ge": "Nota de observação livre por seção", "so": "..." },
  "progress": {
    "ge": { "title": "Info Gerais", "pct": 100, "filled": 4, "total": 4 }
  },
  "os_devices": [],
  "os_details": [],
  "mez_details": [],
  "etiquetas_custom": []
}
```

- **meta.project** — Nome do projeto extraído de `g1` ou `g2`.
- **meta.v** — Versão da checklist (`"4.0"` a partir desta versão).
- **meta.total_pct / meta.filled** — Percentual e contagem de campos obrigatórios preenchidos no momento da exportação.
- **sections** — Objeto com os campos respondidos, agrupados por seção de ID curto.
- **pbl_lines** — Array com os dados de cada linha de FlowRack/PBL. Cada objeto contém os campos respondidos naquela linha.
- **notes** — Observações livres por seção (campo de texto aberto no rodapé de cada seção).
- **progress** — Resumo de progresso por seção no momento da exportação.

---

## Valores padrão de selects

Vários campos usam os mesmos valores base:

| Valor no JSON | Significado |
|---|---|
| `yes` | Sim |
| `no` | Não |
| `tbd` | A definir (ainda não decidido) |

**Responsabilidade (RS)** — usado em `os_r`, `ct_r`, `fc_r`, `pk_es`:

| Valor | Significado |
|---|---|
| `wcs` | WCS |
| `wms_only` | Só o WMS |
| `both_wms_wcs` | WCS + WMS (ambos) |
| `tbd` | A definir |

**Fornecedor (FN)** — usado em `ct_df`, `fc_if`, `fc_re`, `pk_imp_f`, campos de PBL:

| Valor | Significado |
|---|---|
| `invent` | Invent |
| `client` | Cliente |
| `both_resp` | Ambos |
| `tbd` | A definir |

---

## Seção: `ge` — Informações Gerais do Projeto

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `g1` | Nome do cliente contratante | texto | `"Lojas Renner"` |
| `g2` | Nome ou código interno do projeto | texto | `"Beta Esteio"` |
| `g_codinome` | Codinome interno do projeto | texto | `"Projeto Colibri"` |
| `g3` | Localização física do CD | texto | `"Esteio - RS"` |
| `g4` | Novo projeto ou aditivo de projeto existente | select | `"new_proj"` = Projeto novo, `"additive"` = Aditivo, `"tbd"` |
| `g4a` | Escopo do aditivo *(só aparece se g4 = additive)* | textarea | `"Ampliação do módulo PTL"` |
| `g5` | Sistema do Cliente (WMS/EWM/SAP/outros) — **obrigatório** | select (WMS) | `"Manhattan Associates"`, `"SAP EWM"`, `"CONCINCO"`, etc. |
| `g_golive` | Data alvo de GoLive — **obrigatório** | texto | `"24/06/2026"` |

---

## Seção: `la` — Layout e Caixas

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `l1` | Tipo de caixa/tote que transita na esteira | select | `"plastic"` = Plástica, `"cardboard"` = Papelão, `"both_box"` = Ambos, `"tote"` = Tote, `"misto_box"` = Misto, `"tbd"` |
| `l_esteira` | Possui esteira/conveyor automatizada | select | `"yes"`, `"no"`, `"tbd"` |
| `l3` | Possui mezanino | select | `"yes"`, `"no"`, `"tbd"` |
| `l5` | Quantidade de níveis do mezanino *(só aparece se l3 = yes)* | texto | `"3"` |
| `l6` | Utiliza AMR (Autonomous Mobile Robot) | select | `"yes"`, `"no"`, `"tbd"` |

---

## Seção: `cu` — Cubagem Volumétrica

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `cu1` | Possui módulo de cubagem — **gate question** | select | `"yes"`, `"no"`, `"tbd"` |
| `c1` | Quem calcula a cubagem *(só aparece se cu1 = yes)* | select | `"wcs"` = WCS calcula, `"wms_only"` = WMS calcula, `"tbd"` |
| `c2` | Utiliza múltiplos tipos/tamanhos de caixa de embarque *(só aparece se cu1 = yes)* | select | `"yes"`, `"no"`, `"tbd"` |
| `c2a` | Quais tipos de caixa *(só aparece se c2 = yes)* | texto | `"Papelão P, M, G"` |

---

## Seção: `os` — Order Start

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `os_gate` | Tem Order Start? — **gate question**: se `"no"`, seção é ignorada | select | `"yes"`, `"no"`, `"tbd"` |
| `os_r` | Responsabilidade WCS/WMS no Order Start | select (RS) | `"wcs"`, `"wms_only"`, `"both_wms_wcs"`, `"tbd"` | `"wcs"`, `"wms_only"`, `"both_wms_wcs"`, `"tbd"` |
| `os1` | Quantidade de postos de Order Start no CD | texto | `"2"` |
| `os_imp_etq` | Imprime etiqueta na caixa ao iniciar pedido | select | `"yes"`, `"no"`, `"tbd"` |
| `os4` | Método de vinculação da caixa física ao pedido virtual | select | `"scan_fix"` = Scanner fixo automático, `"scan_man"` = Manual, `"tbd"` |
| `os5` | Cada nível de mezanino possui seu próprio Order Start | select | `"yes"`, `"no"`, `"tbd"` |

---

## Seção: `pb` — PBL / FlowRack (Pick-by-Light)

Esta seção contém apenas 3 campos de configuração global. As perguntas detalhadas por linha de FlowRack ficam no array `pbl_lines[]` (ver abaixo).

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `p1` | Possui picking guiado por luz (PBL/FlowRack) — **gate question**: se `"no"`, seção é ignorada | select | `"yes"`, `"no"`, `"tbd"` |
| `pk_tp` | Throughput alvo da linha (caixas/hora) | texto | `"3000"` |
| `pk_es` | Quem gerencia o estoque das posições de picking | select | `"wcs"`, `"wms_only"`, `"tbd"` |

### `pbl_lines[]` — Campos por linha de FlowRack

Cada objeto do array `pbl_lines` representa uma linha/zona PBL e contém:

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `p_r` | Responsabilidade WCS/WMS nesta linha | select (RS) | `"wcs"`, `"wms_only"`, `"both_wms_wcs"`, `"tbd"` |
| `p_m` | Modo de operação do picking | select | `"led_mode"` = LED, `"bar_mode"` = Cód. barras, `"tbd"` |
| `p_led` | Tipo de LED *(só aparece se p_m = led_mode)* | select | `"led3"` = LED 3 dígitos, `"led10"` = LED 10 dígitos, `"tbd"` |
| `p_g` | Curva de giro dos produtos nesta linha | select | `"both_turn"` = Ambos, `"high_turn"` = Alto giro, `"med_turn"` = Médio, `"low_turn"` = Baixo, `"tbd"` |
| `p2` | Quantidade de estações/zonas PBL nesta linha | texto | `"8"` |
| `p_pdv` | Possui PDV (terminal de operação) | select | `"yes"`, `"no"`, `"tbd"` |
| `p_pdv_f` | Quem fornece o PDV *(só aparece se p_pdv = yes)* | select (FN) | `"invent"`, `"client"`, `"both_resp"`, `"tbd"` |
| `p_sct` | Tipo de scanner | select | `"sc_hand"` = Scanner de mão, `"sc_fixed"` = Scanner fixo, `"tbd"` |
| `p_sc_f` | Quem fornece o scanner | select (FN) | `"invent"`, `"client"`, `"both_resp"`, `"tbd"` |
| `p3` | Bipagem do EAN é obrigatória — scanner de mão *(só aparece se p_sct = sc_hand)* | select | `"bip_yes"` = Obrigatória, `"bip_no"` = Não, `"bip_param"` = Parametrizável, `"tbd"` |
| `p3b` | Bipagem do EAN é obrigatória — scanner fixo *(só aparece se p_sct = sc_fixed)* | select | Mesmas opções de `p3` |
| `p_pf` | Quantidade de posições na frente | texto | `"36"` |
| `p10` | Possui picking de costas | select | `"yes"`, `"no"`, `"tbd"` |
| `p_pc` | Quantidade de posições nas costas *(só aparece se p10 = yes)* | texto | `"16"` |
| `p10l` | Costas possuem LED *(só aparece se p10 = yes)* | select | `"yes"`, `"no"`, `"tbd"` |
| `p10lt` | Tipo de LED nas costas *(só aparece se p10l = yes)* | select | `"led3"`, `"led10"`, `"tbd"` |
| `p_re` | Quem fornece os equipamentos PBL | select (FN) | `"invent"`, `"client"`, `"both_resp"`, `"tbd"` |
| `s1p` | Corte/shortpick exige aprovação do supervisor | select | `"yes"`, `"no"`, `"tbd"` |
| `s2p` | Possui funcionalidade "Pede Caixa" (criar caixa-filha) | select | `"yes"`, `"no"`, `"tbd"` |
| `s3p` | Operador deve informar motivo do corte | select | `"yes"`, `"no"`, `"tbd"` |

---

## Seção: `ct` — Picking Cart (Carrinho de Separação)

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `ct1` | Possui picking por carrinho móvel — **gate question** | select | `"yes"`, `"no"`, `"tbd"` |
| `ct_r` | Responsabilidade WCS/WMS no Cart | select (RS) | `"wcs"`, `"wms_only"`, `"both_wms_wcs"`, `"tbd"` |
| `ct_qc` | Quantidade de carrinhos | texto | `"6"` |
| `ct2` | Quantidade de posições/slots por carrinho | texto | `"9"` |
| `ct_d` | Tipo de dispositivo no carrinho | select | `"pdv_dev"` = PDV, `"col_dev"` = Coletor, `"tbd"` |
| `ct_df` | Quem fornece o dispositivo | select (FN) | `"invent"`, `"client"`, `"both_resp"`, `"tbd"` |
| `ct6` | Destino da caixa ao concluir coleta no carrinho | select | `"dest_pbl"` = Completa PBL, `"dest_conf"` = Conferência, `"dest_pack"` = Packing, `"tbd"` |
| `s1c` | Corte exige aprovação do supervisor (Cart) | select | `"yes"`, `"no"`, `"tbd"` |
| `s2c` | Possui "Pede Caixa" no Cart | select | `"yes"`, `"no"`, `"tbd"` |

---

## Seção: `fc` — Full Case (Caixas Fechadas)

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `fc1` | Possui picking de caixas fechadas — **gate question** | select | `"yes"`, `"no"`, `"tbd"` |
| `fc_r` | Responsabilidade WCS/WMS no Full Case | select | `"wcs"`, `"wms_only"`, `"both_wms_wcs"`, `"tbd"` |
| `fc2` | Método de full case *(só aparece se fc_r = wcs)* | select | `"fc_coletor"` = Coletor, `"fc_etiq_led"` = Etiq+LED, `"fc_etiq"` = Etiqueta, `"tbd"` |
| `fc2b` | Método de full case *(só aparece se fc_r = both_wms_wcs)* | select | Mesmas opções de `fc2` |
| `fc_i` | Possui impressora no Full Case | select | `"yes"`, `"no"`, `"tbd"` |
| `fc_if` | Quem fornece a impressora *(só aparece se fc_i = yes)* | select (FN) | `"invent"`, `"client"`, `"both_resp"`, `"tbd"` |
| `fc_re` | Quem fornece os equipamentos de Full Case | select (FN) | `"invent"`, `"client"`, `"both_resp"`, `"tbd"` |
| `fc_qe` | Quantidade de equipamentos | texto | `"3"` |

---

## Seção: `cf` — Conferência / Auditoria de Qualidade

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `cf_t1` | Tipo(s) de conferência pós-desvio (múltipla escolha) | multi | Valores separados por `\|\|\|`: `"conf_blind"` = Cega, `"conf_item"` = Item a Item, `"conf_multi"` = Multiplicador, `"conf_ean"` = Bipa EAN |
| `cf2` | Quantidade de estações de conferência | texto | `"12"` |
| `cf_t2` | Motivos que desviam volume para conferência (múltipla escolha) | multi | `"conf_weight"` = Balança, `"conf_rfid"` = RFID, `"conf_sample"` = Amostragem, `"conf_client"` = Por cliente, `"conf_product"` = Por produto, `"conf_100"` = 100% dos itens |
| `cf4` | Tolerância da balança dinâmica | texto | `"±5g"` ou `"±2%"` |

---

## Seção: `pk` — Conferência & Packing

Esta seção possui **duplo gate**: `cf_gate` (conferência) e `pk1` (packing). Se ambos forem `"no"`, a seção inteira fica inativa ("escura"). Cada gate controla sua própria sub-seção.

### Conferência / Auditoria de Qualidade

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `cf_gate` | **Gate question de conferência** — se `"no"`, campos `cf_*` são ignorados — **obrigatório** | select | `"yes"`, `"no"`, `"tbd"` |
| `cf_t1` | Tipo(s) de conferência pós-desvio — **obrigatório** *(só aparece se cf_gate = yes)* | multi | Separados por `\|\|\|`: `"conf_blind"` = Cega, `"conf_item"` = Item a Item, `"conf_multi"` = Multiplicador, `"conf_ean"` = Bipa EAN |
| `cf2` | Quantidade de estações de conferência — **obrigatório** *(só aparece se cf_gate = yes)* | texto | `"12"` |
| `cf_t2` | Motivos que desviam volume para conferência — **obrigatório** *(só aparece se cf_gate = yes)* | multi | `"conf_weight"` = Balança, `"conf_rfid"` = RFID, `"conf_sample"` = Amostragem, `"conf_client"` = Por cliente, `"conf_product"` = Por produto, `"conf_100"` = 100% dos itens |
| `cf4` | Tolerância da balança dinâmica *(só aparece se cf_gate = yes)* | texto | `"±5g"` ou `"±2%"` |

### Packing (Embalagem Final)

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `pk1` | Possui etapa de packing — **gate question**: se `"no"`, campos packing abaixo são ignorados | select | `"yes"`, `"no"` |
| `pk_auto` | Packing automatizado *(só aparece se pk1 = yes)* | select | `"yes"`, `"no"`, `"tbd"` |
| `pk_imp` | Possui impressora no packing *(só aparece se pk1 = yes)* | select | `"yes"`, `"no"`, `"tbd"` |
| `pk_imp_f` | Quem fornece a impressora *(só aparece se pk_imp = yes)* | select (FN) | `"invent"`, `"client"`, `"both_resp"`, `"tbd"` |
| `pk_imp_t` | Impressão manual ou automática *(só aparece se pk_imp = yes)* | select | `"imp_manual"` = Manual, `"imp_auto"` = Automática, `"tbd"` |
| `pk_troca` | Troca de caixa (plástica → papelão) na etapa de packing — ativa `[SE: TROCA_CAIXA_PACKING]` no Super MD *(só aparece se pk1 = yes)* | select | `"yes"`, `"no"`, `"tbd"` |
| `pk_etiq` | Troca de etiqueta no packing *(só aparece se pk1 = yes)* | select | `"yes"`, `"no"`, `"tbd"` |

---

## Seção: `so` — Sorter (Máquina Classificadora)

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `st1` | Possui Sorter — **gate question** | select | `"yes"`, `"no"`, `"tbd"` |
| `st2` | Quantidade de rampas de saída | texto | `"20"` |
| `st3` | Quantidade de rampas de rejeito | texto | `"1"` |
| `st_cap` | Capacidade alvo em volumes por hora | texto | `"1200"` |
| `st4` | SLA — tempo do portal ao primeiro HPD (em segundos) | texto | `"45"` |
| `st5` | Quantidade de pontos de indução de volumes | texto | `"2"` |
| `st6` | Número de faces do portal de leitura de código | texto | `"5"` |
| `st_criterio` | Critério de desvio para a rampa | select | `"regiao"` = Região, `"transp"` = Transportadora, `"filial"` = Filial/Destino, `"outro"` = Outro |
| `st7` | Portal realiza cross-check (validação cruzada SKU × pedido × destino) | select | `"yes"`, `"no"`, `"tbd"` |
| `st10` | Rampas possuem sinaleiro luminoso (verde/vermelho) | select | `"yes"`, `"no"` |
| `st11` | Sorter utiliza câmera com IA (leitura múltiplos códigos) | select | `"yes"`, `"no"`, `"tbd"` |
| `st_rc` | Possui esteira de recirculação — quando `"yes"`, volumes com NoRead, Sem Rota, Sem Mapa, MultiRead e Perda de Tracking recirculam em vez de ir ao rejeito. Ativa `[SE: RECIRCULACAO]` e `[SE: MULTIREAD_RECIRCULACAO]` no Super MD | select | `"yes"`, `"no"`, `"tbd"` |
| `st_ag` | Agrupador de rampas (critério de agrupamento) | texto | `"UF"` ou `"Transportadora"` |

---

## Seção: `pt` — Palletização & PTL

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `pt_gate` | Tem Palletização & PTL? — **gate question**: se `"no"`, seção é ignorada | select | `"yes"`, `"no"`, `"tbd"` |
| `pt1` | Tipo de palletização/expedição | select | `"ptl_opt"` = PTL, `"ptm_opt"` = PTM, `"aloca_opt"` = Aloca Pallet, `"no_pal"` = Sem paletização, `"tbd"` |
| `pt3` | Quantidade total de posições (pallets/gaiolas de destino) | texto | `"168"` |
| `pt_frag` | Possui Matriz de Fragilidade (classificação de itens frágeis para regras de empilhamento) — ativa `[SE: MATRIZ_FRAGILIDADE]` no Super MD | select | `"yes"`, `"no"`, `"tbd"` |
| `pt_ag` | Agrupador de palletização | texto | `"Transportadora"` ou `"Região"` |
| `pt8` | Itens perigosos exigem pallet exclusivo | select | `"yes"`, `"no"`, `"tbd"` |
| `pt9` | Sistema imprime romaneio ao fechar pallet | select | `"yes"`, `"no"`, `"tbd"` |
| `pt_tem_ptl` | Possui displays PTL físicos nas posições | select | `"yes"`, `"no"`, `"tbd"` |
| `pt_tipo_disp` | Tipo de display PTL *(só aparece se pt_tem_ptl = yes)* | select | `"ptl_hw"` = PTL (displays físicos), `"tablet_ptl"` = Tablet, `"outro"` = Outro |
| `pt_tvs_ptl` | Quantidade de TVs/displays PTL *(só aparece se pt_tem_ptl = yes)* | texto | `"10"` |
| `pt_ptm` | Possui PTM (Put-to-Monitor) | select | `"yes"`, `"no"`, `"tbd"` |
| `pt_ptm_qtd` | Quantidade de TVs PTM *(só aparece se pt_ptm = yes)* | texto | `"4"` |

---

## Seção: `es` — Gestão de Estoque WCS (Estoque Sombra)

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `es1` | WCS gerencia o estoque das posições de picking — **gate question** | select | `"yes"`, `"no"`, `"tbd"` |
| `es2` | WCS gera missões automáticas de reabastecimento | select | `"yes"`, `"no"`, `"tbd"` |
| `es3` | Reabastecimento via Sorter (ciclo da rampa) | select | `"yes"`, `"no"`, `"tbd"` |
| `es4` | WCS possui módulo de inventário/auditoria cíclica | select | `"yes"`, `"no"`, `"tbd"` |
| `es5` | WCS possui funcionalidade de Recall (bloqueio de lote contaminado) | select | `"yes"`, `"no"`, `"tbd"` |
| `es6` | WCS permite movimentação forçada (bypass para realocar estoque) | select | `"yes"`, `"no"`, `"tbd"` |
| `es7` | WCS calcula e sugere alocação de SKUs por Curva ABC | select | `"yes"`, `"no"`, `"tbd"` |
| `es8` | Range de dias para cálculo da Curva ABC *(só aparece se es7 = yes)* | texto | `"7, 15, 30"` |
| `es10` | Double check — verificação dupla na expedição — ativa `[SE: OCORRENCIAS]` no Super MD | select | `"yes"`, `"no"`, `"tbd"` |

---

## Seção: `et` — Etiquetas e Impressão

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `et_r` | Responsabilidade pelas etiquetas | select | `"wcs"` = WCS, `"wms_only"` = WMS, `"tbd"` |
| `et1` | Quantidade total de impressoras térmicas no projeto | texto | `"5"` |
| `et_dist` | Distribuição física das impressoras no CD | texto | `"1 térreo, 1 por nível de mezanino, 1 na doca"` |

---

## Seção: `in` — Integração WCS-WMS

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `in1` | Protocolo/tecnologia de integração | select | `"rest"` = REST, `"idoc"` = IDoc, `"dblink"` = DBLink, `"excel"` = Excel, `"json_api"` = JSON via API, `"json_pasta"` = JSON em pasta, `"outro"` = Outro, `"tbd"` = A definir |
| `in1b` | Protocolo secundário *(só aparece se in1 = outro)* | texto | Descrição do protocolo |
| `in_endpoint` | Endpoint/URL da integração | texto | `"https://api.cliente.com/wcs"` |
| `in3` | Timeout máximo aceito para chamadas em milissegundos | texto | `"5000"` |

---

## Seção: `if` — Infraestrutura de TI

| Campo | Descrição | Tipo | Exemplo / Opções |
|---|---|---|---|
| `if_titul` | Titular da infraestrutura | select | `"srv_invent"` = Invent, `"srv_client"` = Cliente, `"srv_shared"` = Compartilhada |
| `if_ambiente` | Tipo de ambiente de hospedagem | select | `"onprem"` = On-premise, `"saas"` = SaaS, `"cloud"` = Cloud, `"hybrid"` = Híbrido, `"tbd"` |
| `if_s` | Servidor único ou separado (app + banco) | select | `"single_srv"` = Único, `"sep_srv"` = Separados, `"tbd"` |
| `if_ambientes` | Possui ambientes PRD + HML | select | `"yes"`, `"no"`, `"tbd"` |
| `if_focal` | Nome e e-mail do focal de TI do cliente | texto | `"João Silva — joao@cliente.com"` |
| `if_data_infra` | Data de entrega da infraestrutura | texto | `"10/06/2026"` |
| `if1` | Sistema operacional do servidor | select | `"win"` = Windows Server, `"linux"` = Linux, `"tbd"` |
| `if2` | Motor de banco de dados | select | `"mssql"` = SQL Server, `"pg"` = PostgreSQL, `"oracle"` = Oracle, `"mysql"` = MySQL, `"tbd"` |
| `if3` | VLAN dedicada para o WCS | select | `"yes"`, `"no"`, `"tbd"` |
| `if4` | VPN configurada para acesso remoto da equipe Invent | select | `"yes"`, `"no"`, `"tbd"` |
| `if5` | Quantidade de estações de trabalho no chão de fábrica | texto | `"10"` |
| `if6` | Acesso à internet disponível no chão de fábrica | select | `"yes"`, `"no"`, `"tbd"` |
| `if7` | Especificações técnicas do servidor (CPU, RAM, disco) | texto | `"8 cores, 32GB RAM, 500GB SSD"` |
| `if8` | Ambiente usa Active Directory ou SSO | select | `"yes"`, `"no"`, `"tbd"` |
| `if9` | Protocolo de comunicação com CLPs | texto | `"OPC-UA"` ou `"Modbus TCP"` |
| `if10` | Estratégia de backup definida para o banco WCS | select | `"yes"`, `"no"`, `"tbd"` |

---

## Exemplo completo de JSON exportado

```json
{
  "meta": {
    "project": "Lojas Renner",
    "date": "2026-06-10T14:30:00.000Z",
    "v": "4.0",
    "total_pct": 85,
    "filled": 40
  },
  "sections": {
    "ge": {
      "g1": "Lojas Renner",
      "g2": "Beta Esteio",
      "g_codinome": "Projeto Colibri",
      "g3": "Esteio - RS",
      "g4": "new_proj",
      "g5": "Manhattan Associates",
      "g_golive": "24/06/2026"
    },
    "la": {
      "l1": "plastic",
      "l_esteira": "yes",
      "l3": "yes",
      "l5": "3",
      "l6": "no"
    },
    "cu": {
      "cu1": "yes",
      "c1": "wcs",
      "c2": "no"
    },
    "os": {
      "os_gate": "yes",
      "os_r": "wcs",
      "os1": "2",
      "os_imp_etq": "yes",
      "os4": "scan_fix",
      "os5": "no"
    },
    "pb": {
      "p1": "yes",
      "pk_tp": "3000",
      "pk_es": "wcs"
    },
    "ct": {
      "ct1": "yes",
      "ct_r": "wcs",
      "ct_qc": "4",
      "ct2": "9",
      "ct_d": "pdv_dev",
      "ct_df": "invent",
      "ct6": "dest_conf",
      "s1c": "yes",
      "s2c": "yes"
    },
    "fc": {
      "fc1": "yes",
      "fc_r": "wcs",
      "fc2": "fc_coletor",
      "fc_i": "yes",
      "fc_if": "invent",
      "fc_re": "invent"
    },
    "pk": {
      "cf_gate": "yes",
      "cf_t1": "conf_blind|||conf_ean",
      "cf2": "12",
      "cf_t2": "conf_weight|||conf_sample",
      "pk1": "yes",
      "pk_auto": "no",
      "pk_imp": "yes",
      "pk_imp_f": "invent",
      "pk_imp_t": "imp_auto",
      "pk_troca": "yes",
      "pk_etiq": "no"
    },
    "so": {
      "st1": "yes",
      "st2": "20",
      "st3": "1",
      "st_cap": "1200",
      "st4": "45",
      "st_criterio": "transp",
      "st7": "yes",
      "st10": "yes",
      "st11": "no",
      "st_rc": "yes"
    },
    "pt": {
      "pt_gate": "yes",
      "pt1": "ptl_opt",
      "pt3": "168",
      "pt_frag": "yes",
      "pt8": "no",
      "pt9": "yes",
      "pt_tem_ptl": "yes",
      "pt_tipo_disp": "ptl_hw",
      "pt_tvs_ptl": "10",
      "pt_ptm": "no"
    },
    "es": {
      "es1": "yes",
      "es2": "yes",
      "es3": "yes",
      "es4": "yes",
      "es5": "yes",
      "es7": "yes",
      "es8": "30",
      "es10": "yes"
    },
    "et": {
      "et_r": "wcs",
      "et1": "5",
      "et_dist": "1 térreo, 1 por nível, 1 doca"
    },
    "in": {
      "in1": "rest",
      "in_endpoint": "https://api.renner.com/wcs",
      "in3": "5000"
    },
    "if": {
      "if_titul": "srv_client",
      "if_ambiente": "onprem",
      "if_s": "sep_srv",
      "if_ambientes": "yes",
      "if1": "win",
      "if2": "mssql",
      "if3": "yes",
      "if4": "yes",
      "if5": "10",
      "if6": "yes"
    }
  },
  "pbl_lines": [
    {
      "p_r": "wcs",
      "p_m": "led_mode",
      "p_led": "led3",
      "p_g": "high_turn",
      "p2": "8",
      "p_pdv": "yes",
      "p_pdv_f": "invent",
      "p_sct": "sc_hand",
      "p_sc_f": "invent",
      "p3": "bip_yes",
      "p_pf": "36",
      "p10": "yes",
      "p_pc": "16",
      "p10l": "yes",
      "p10lt": "led3",
      "p_re": "invent",
      "s1p": "yes",
      "s2p": "yes"
    }
  ],
  "notes": {
    "so": "Sorter modelo Vanderlande POSISORTER"
  },
  "progress": {
    "ge": { "title": "Info Gerais", "pct": 100, "filled": 4, "total": 4 },
    "la": { "title": "Layout e Caixas", "pct": 100, "filled": 3, "total": 3 },
    "so": { "title": "Sorter", "pct": 100, "filled": 4, "total": 4 }
  },
  "os_devices": [],
  "os_details": [],
  "mez_details": [],
  "etiquetas_custom": []
}
```

---

## Notas para uso em IAs

- Campos ausentes no JSON significam que **não foram respondidos** ou **não se aplicam** ao projeto.
- Campos com valor `"tbd"` significam que a decisão ainda será tomada.
- Os campos `cf_t1` e `cf_t2` (conferência) usam `|||` como separador de múltiplos valores.
- Campos marcados como **gate question** controlam a relevância da seção inteira: se o gate = `"no"`, os demais campos da seção podem ser ignorados.
- O campo `cu1` é o gate de cubagem: se `"no"`, `c1`, `c2` e `c2a` podem ser ignorados.
- O campo `p1` é o gate de PBL: se `"no"`, o array `pbl_lines` pode ser ignorado.
- O campo `es1` é o gate de estoque sombra: se `"no"`, toda a seção `es` pode ser ignorada.
- O campo `pk_troca` = `"yes"` ativa o bloco `[SE: TROCA_CAIXA_PACKING]` no Super MD.
- O campo `st_rc` = `"yes"` ativa os blocos `[SE: RECIRCULACAO]` e `[SE: MULTIREAD_RECIRCULACAO]` no Super MD.
- O campo `pt_frag` = `"yes"` ativa o bloco `[SE: MATRIZ_FRAGILIDADE]` no Super MD.
- O campo `es10` = `"yes"` ativa o bloco `[SE: OCORRENCIAS]` no Super MD.
- IDs de seção nesta versão são **curtos** (`ge`, `la`, `cu`, etc.) — diferente das versões anteriores à v3.0 que usavam nomes longos (`geral`, `layout`, etc.).
