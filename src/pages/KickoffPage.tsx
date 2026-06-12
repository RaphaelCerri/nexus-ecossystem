// @ts-nocheck
/* eslint-disable */
import { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import { loadProject, upsertProject, generateCode, generateId } from '../lib/projectStore';

// ─── Palette constants (kept for cross-reference; actual styles via sx/theme) ─
var Y = '#ffc500';

// ─── Option labels ────────────────────────────────────────────────────────────
var O = {
  yes:'Sim',no:'Não',tbd:'A definir',
  new_proj:'Novo',additive:'Aditivo',
  wcs:'WCS',wms_only:'WMS',both_wms_wcs:'Ambos',
  plastic:'Plástica',cardboard:'Papelão',both_box:'Ambos',tote:'Tote',misto_box:'Misto',tote_plastic:'Tote/Plástica',fardo:'Fardo',
  desktop:'Desktop',tablet:'Tablet',collector:'Coletor',
  scan_fix:'Fixo',scan_man:'Manual',
  bip_yes:'Obrigatória',bip_no:'Não',bip_param:'Parametrizável',
  led_mode:'LED',bar_mode:'Cód. barras',
  both_turn:'Ambos',high_turn:'Alto giro',med_turn:'Médio giro',low_turn:'Baixo giro',
  pdv_dev:'PDV',col_dev:'Coletor',
  dest_pbl:'Completa PBL',dest_conf:'Conferência',dest_pack:'Packing',
  fc_coletor:'Coletor',fc_etiq_led:'Etiq+LED',fc_etiq:'Etiqueta',
  invent:'Invent',client:'Cliente',both_resp:'Ambos',
  led3:'LED 3 dig',led10:'LED 10 dig',
  sc_hand:'Scanner de mão',sc_fixed:'Scanner fixo',
  conf_blind:'Cega',conf_item:'Item a Item',conf_multi:'Multiplicador',conf_ean:'Bipa EAN',
  conf_weight:'Balança',conf_rfid:'RFID',conf_sample:'Amostragem',conf_client:'Por cliente',conf_product:'Por produto',conf_100:'100% itens',
  imp_manual:'Manual',imp_auto:'Automática',
  rest:'REST',idoc:'IDoc',dblink:'DBLink',excel:'Excel',outro:'Outro',
  json_api:'JSON via API',json_pasta:'JSON em pasta',
  win:'Windows',linux:'Linux',
  mssql:'SQL Server',pg:'PostgreSQL',oracle:'Oracle',mysql:'MySQL',
  ptl_opt:'PTL',ptm_opt:'PTM',aloca_opt:'Aloca Pallet',no_pal:'Sem paletização',
  srv_invent:'Invent',srv_client:'Cliente',srv_tbd:'A definir',srv_shared:'Compartilhada',
  single_srv:'Único',sep_srv:'Separados',
  onprem:'On-premise',saas:'SaaS',cloud:'Cloud',hybrid:'Híbrido',
  regiao:'Região',transp:'Transportadora',filial:'Filial/Destino',
  ptl_hw:'PTL (displays físicos)',tablet_ptl:'Tablet',
};
var to = function(v) { return O[v] || v; };
var YN = ['yes','no','tbd'], RS = ['wcs','wms_only','both_wms_wcs','tbd'], FN = ['invent','client','both_resp','tbd'];
function Q(a,b,c,d,e,f,g,h) { return {id:a,q:b,t:c,e:!!d,o:e||null,g:!!f,d:g||null,p:h||null}; }

var WMS_KEY = 'nexus_wms_custom';
function getWmsList() { try { var c=JSON.parse(localStorage.getItem(WMS_KEY)||'[]'); return [...new Set(['CONCINCO','SAP EWM','SAP WM (legacy)','TOTVS WMS','Oracle WMS Cloud','Manhattan Associates','Infor WMS','JDA / Blue Yonder','Linx WMS','Sankhya WMS','Track WMS','GFT','Bsoft','Outro',...c])]; } catch(e) { return ['CONCINCO','SAP EWM','TOTVS WMS','Oracle WMS Cloud','Outro']; } }
function saveCustomWms(val) { if(!val||val.length<2)return; try { var c=JSON.parse(localStorage.getItem(WMS_KEY)||'[]'); if(!c.includes(val)){ c.push(val); localStorage.setItem(WMS_KEY,JSON.stringify(c)); } } catch(e) {} }

var SEC = [
  {id:'ge',n:'1',t:'Info Gerais',dept:'gest',q:[
    Q('g1','Cliente','text',1),Q('g2','Código do Projeto','text',1),Q('g_codinome','Codinome do Projeto','text',1,0,0,0,'Ex: Projeto Colibri'),Q('g3','Local do CD','text',1),
    Q('g4','Novo ou aditivo?','select',1,['new_proj','additive','tbd']),
    Q('g4a','Escopo do aditivo','textarea',0,0,0,'g4:additive','Descreva o escopo'),
    Q('g5','Sistema do Cliente','wms',1),
    Q('g_golive','GoLive alvo','text',1,0,0,0,'Ex: 24/06/2026'),
    Q('g_layout_ref','Layout Semelhante','text',0,0,0,0,'Ex: CD Kalunga 2023'),
  ]},
  {id:'la',n:'2',t:'Layout e Caixas',dept:'gest',q:[
    Q('c2','Múltiplos tipos de caixa?','select',1,YN),
    Q('l1','Tipo Caixa','select',1,['tote_plastic','cardboard','fardo','misto_box','tbd'],0,'c2:no'),
    Q('l1_m','Tipo Caixa','multi',1,['tote_plastic','cardboard','fardo','misto_box','tbd'],0,'c2:yes'),
    Q('l3','Tem mezanino?','select',1,YN),
    Q('l5','Quantos niveis?','text',1,0,0,'l3:yes'),
    Q('l6','Tem AMR?','select',0,YN),
  ]},
  {id:'cu',n:'3',t:'Cubagem',dept:'gest',q:[
    Q('cu1','Tem Cubagem?','select',1,YN,1),
    Q('c1','Quem faz cubagem?','select',1,['wcs','wms_only','tbd']),
  ]},
  {id:'in',n:'4',t:'Integração',dept:'infra',q:[
    Q('in1','Tipo integracao','select',1,['rest','idoc','dblink','excel','json_api','json_pasta','outro','tbd']),
    Q('in1b','Tipo integracao 2','select',0,['rest','idoc','dblink','excel','json_api','json_pasta','outro','tbd']),
    Q('in_endpoint','Endpoint/URL','text',0,0,0,0,'Ex: https://api.cliente.com/wcs'),
    Q('in3','Timeout (ms)','text',0),
  ]},
  {id:'os',n:'5',t:'Order Start',dept:'gest',q:[
    Q('os_gate','Tem Order Start?','select',1,YN,1),
    Q('os_r','Responsabilidade WCS/WMS','select',1,RS),
    Q('os1','Quantos Order Starts?','text',1),
    Q('os_imp_etq','Imprime etiqueta no OS?','select',0,YN),
    Q('os4','Vinculacao de caixa','select',1,['scan_fix','scan_man','tbd']),
    Q('os5','OS por nível?','select',0,YN),
  ]},
  {id:'pb',n:'6',t:'PBL / FlowRack',dept:'gest',sc:1,q:[
    Q('p1','Tem PBL / FlowRack?','select',1,YN,1),
    Q('pk_tp','Throughput linha (cx/h)','text',0,0,0,0,'Ex: 3000'),
    Q('pk_es','WCS gerencia estoque (picking)?','select',0,['wcs','wms_only','tbd']),
  ]},
  {id:'ct',n:'7',t:'Picking Cart',dept:'gest',sc:1,q:[
    Q('ct1','Tem Picking Cart?','select',1,YN,1),
    Q('ct_r','Responsabilidade WCS/WMS','select',1,RS),
    Q('ct_qc','Qtd carrinhos','text',1),
    Q('ct2','Posicoes/carrinho','text',1),
    Q('ct_d','Dispositivo','select',1,['pdv_dev','col_dev','tbd']),
    Q('ct_df','Quem fornece o dispositivo?','select',1,FN),
    Q('ct6','Destino pos-coleta','select',1,['dest_pbl','dest_conf','dest_pack','tbd']),
    Q('s1c','Corte exige supervisor?','select',1,YN),
    Q('s2c','Pede Caixa?','select',1,YN),
  ]},
  {id:'fc',n:'8',t:'Full Case',dept:'gest',sc:1,q:[
    Q('fc1','Tem Full Case?','select',1,YN,1),
    Q('fc_r','Responsabilidade WCS/WMS','select',1,['wcs','wms_only','both_wms_wcs','tbd']),
    Q('fc2','Metodo','select',1,['fc_coletor','fc_etiq_led','fc_etiq','tbd'],0,'fc_r:wcs'),
    Q('fc2b','Metodo','select',1,['fc_coletor','fc_etiq_led','fc_etiq','tbd'],0,'fc_r:both_wms_wcs'),
    Q('fc_i','Tem impressora?','select',1,YN),
    Q('fc_if','Quem fornece a impressora?','select',1,FN,0,'fc_i:yes'),
    Q('fc_re','Quem fornece equip. Full Case?','select',1,FN),
    Q('fc_qe','Quantos equip.?','text',0),
  ]},
  {id:'pk',n:'9',t:'Conferência & Packing',dept:'gest',q:[
    Q('cf_gate','Tem Conferência?','select',1,['yes','no','tbd']),
    Q('cf_t1','Tipo de conferência','multi',1,['conf_blind','conf_item','conf_multi','conf_ean','tbd'],0,'cf_gate:yes'),
    Q('cf2','Estações de conferência','text',1,0,0,'cf_gate:yes'),
    Q('cf_t2','Motivos de desvio p/ conferência','multi',1,['conf_weight','conf_rfid','conf_sample','conf_client','conf_product','conf_100','tbd'],0,'cf_gate:yes'),
    Q('cf4','Tolerância da balança','text',0,0,0,'cf_gate:yes'),
    Q('pk1','Tem Packing?','select',1,['yes','no','tbd']),
    Q('pk_auto','Packing automatico?','select',0,YN,0,'pk1:yes'),
    Q('pk_imp','Tem impressora no packing?','select',0,YN,0,'pk1:yes'),
    Q('pk_imp_f','Quem fornece a impressora?','select',0,FN,0,'pk_imp:yes'),
    Q('pk_imp_t','Impressão manual ou automática?','select',0,['imp_manual','imp_auto','tbd'],0,'pk_imp:yes'),
    Q('pk_troca','Troca de caixa?','select',0,YN,0,'pk1:yes'),
    Q('pk_etiq','Troca etiqueta?','select',0,YN,0,'pk1:yes'),
  ]},
  {id:'so',n:'10',t:'Sorter',dept:'gest',q:[
    Q('st1','Tem Sorter?','select',1,YN,1),
    Q('st2','Rampas saida','text',1),
    Q('st3','Rejeito','text',1),
    Q('st_cap','Capacidade (vol/h)','text',0,0,0,0,'Ex: 1.200 vol/h'),
    Q('st4','SLA - Portal a Primeiro HPD','text',1),
    Q('st5','Inducao','text',0),
    Q('st6','Portal leitura: faces?','text',0),
    Q('st_criterio','Critério desvio rampa','select',0,['regiao','transp','filial','outro','tbd']),
    Q('st7','Cross-check?','select',0,YN),
    Q('st10','Sinaleiro nas Rampas?','select',0,['yes','no','tbd']),
    Q('st11','IA?','select',1,YN),
    Q('st11_tvs','Qtd TVs I.A','text',1,0,0,'st11:yes','Ex: 2'),
    Q('st_rc','Recirculacao?','select',1,YN),
    Q('st_ag','Agrupador da rampa','text',0),
  ]},
  {id:'pt',n:'11',t:'Palletização & PTL',dept:'gest',q:[
    Q('pt_gate','Tem Palletização & PTL?','select',1,YN,1),
    Q('pt1','Tipo palletizacao','select',1,['no_pal','ptl_opt','ptm_opt','aloca_opt','tbd']),
    Q('pt3','Posicoes','text',1),
    Q('pt_frag','Matriz de fragilidade?','select',0,YN),
    Q('pt_ag','Agrupador Palletizacao','text',0),
    Q('pt8','Itens perigosos?','select',0,YN),
    Q('pt9','Romaneio?','select',0,YN),
    Q('pt_tem_ptl','Tem displays PTL?','select',0,YN),
    Q('pt_tipo_disp','Tipo display','select',0,['ptl_hw','tablet_ptl','outro','tbd'],0,'pt_tem_ptl:yes'),
    Q('pt_tvs_ptl','Qtd TVs PTL','text',0,0,0,'pt_tem_ptl:yes'),
    Q('pt_ptm','Tem PTM (Put to Monitor)?','select',0,YN),
    Q('pt_ptm_qtd','Qtd TVs PTM','text',0,0,0,'pt_ptm:yes'),
  ]},
  {id:'es',n:'12',t:'Gestão de Estoque',dept:'gest',q:[
    Q('es1','Tem Gestão de Estoque?','select',1,YN,1),
    Q('es2','Reabastecimento auto?','select',1,YN),
    Q('es3','Reab. pelo Sorter?','select',0,YN),
    Q('es4','Inventario?','select',0,YN),
    Q('es5','Recall?','select',0,YN),
    Q('es6','Mov. Forcada?','select',0,YN),
    Q('es7','Curva ABC?','select',0,YN),
    Q('es8','Range dias','text',0,0,0,'es7:yes'),
    Q('es10','Double check?','select',0,YN),
  ]},
  {id:'et',n:'13',t:'Etiquetas',dept:'infra',q:[
    Q('et_r','Responsabilidade etiquetas','select',1,['wcs','wms_only','tbd']),
    Q('et1','Total impressoras','text',1),
    Q('et_dist','Distribuição','text',0),
  ]},
  {id:'if',n:'14',t:'Infraestrutura',dept:'infra',q:[
    Q('if_titul','Titular da infra','select',1,['srv_invent','srv_client','srv_shared','tbd']),
    Q('if_ambiente','Tipo de ambiente','select',1,['onprem','saas','cloud','hybrid','tbd']),
    Q('if_s','Servidor: unico ou separado?','select',1,['single_srv','sep_srv','tbd']),
    Q('if_ambientes','Tem PRD + HML?','select',0,YN),
    Q('if_focal','Focal TI do cliente','text',0,0,0,0,'Nome e email'),
    Q('if_data_infra','Data entrega da infra','text',0,0,0,0,'Ex: 10/06/2026'),
    Q('if1','SO','select',1,['win','linux','tbd']),
    Q('if2','BD','select',1,['mssql','pg','oracle','mysql','tbd']),
    Q('if3','VLAN?','select',1,YN),
    Q('if4','VPN?','select',1,YN),
    Q('if5','Estações','text',1),
    Q('if6','Internet?','select',1,YN),
    Q('if7','Specs','text',0),
    Q('if8','AD/SSO?','select',0,YN),
    Q('if9','PLC','text',0),
    Q('if10','Backup?','select',0,YN),
  ]},
];

var GATE_PBL = Q('p1','Tem PBL / FlowRack?','select',1,YN,1);
var PBL_Q = [Q('p_r','Resp WCS/WMS','select',1,RS),Q('p_m','LED ou cod. barras?','select',1,['led_mode','bar_mode','tbd']),Q('p_led','Tipo LED','select',1,['led3','led10','tbd'],0,'p_m:led_mode'),Q('p_g','Giro','select',1,['both_turn','high_turn','med_turn','low_turn','tbd']),Q('p2','Estacoes','text',1),Q('p_pdv','Tem PDV?','select',1,YN),Q('p_pdv_f','Quem fornece o PDV?','select',1,FN,0,'p_pdv:yes'),Q('p_sct','Tipo scanner','select',1,['sc_hand','sc_fixed','tbd']),Q('p_sc_f','Quem fornece o scanner?','select',1,FN),Q('p3','Bipagem EAN?','select',1,['bip_yes','bip_no','bip_param','tbd'],0,'p_sct:sc_hand'),Q('p3b','Bipagem EAN?','select',1,['bip_yes','bip_no','bip_param','tbd'],0,'p_sct:sc_fixed'),Q('p_pf','Posicoes frente','text',1),Q('p10','Picking costas?','select',1,YN),Q('p_pc','Posicoes costas','text',1,0,0,'p10:yes'),Q('p10l','Costas tem LED?','select',1,YN,0,'p10:yes'),Q('p10lt','Tipo LED costas','select',1,['led3','led10','tbd'],0,'p10l:yes'),Q('p_re','Quem fornece equip PBL?','select',1,FN),Q('s1p','Corte exige supervisor?','select',1,YN),Q('s2p','Pede Caixa?','select',1,YN),Q('s3p','Motivo corte obrigatorio?','select',0,YN)];

var PHASES = [
  {id:'ph0',label:'Dados do Projeto',       ids:['ge','la','cu','in'], color:'#ffc500'},
  {id:'ph1',label:'Order Start & Picking',  ids:['os','pb','ct','fc'], color:'#34d399'},
  {id:'ph2',label:'Processo de Saída',       ids:['pk','so','pt'], color:'#fb923c'},
  {id:'ph3',label:'Gestão e Infraestrutura', ids:['es','et','if'], color:'#38bdf8'},
];
function getSecColor(secId){var ph=PHASES.find(function(p){return p.ids.indexOf(secId)>=0;});return ph?ph.color:'#ffc500';}

function gv(s,a) { var gQ=s.q.find(function(q){return q.g;}); if(gQ&&a[gQ.id]==='no')return [gQ]; var vis={}; s.q.forEach(function(q){ if(!q.d){vis[q.id]=true;return;} var p=q.d.split(':'); vis[q.id]=!!vis[p[0]]&&a[p[0]]===p[1]; }); return s.q.filter(function(q){return vis[q.id];}); }
function gp(s,a) { var v=gv(s,a),req=v.filter(function(q){return q.e;}),n=req.filter(function(q){return a[q.id]&&a[q.id]!==''&&!isADefinir(a[q.id],q.t)}); return {a:n.length,t:req.length,p:req.length?Math.round(n.length/req.length*100):0}; }
function gvPbl(line) { var vis={}; PBL_Q.forEach(function(q){ if(!q.d){vis[q.id]=true;return;} var p=q.d.split(':'); vis[q.id]=!!vis[p[0]]&&line[p[0]]===p[1]; }); return PBL_Q.filter(function(q){return vis[q.id];}); }

function getTriggers(a) {
  var ts = [];
  if(a.st11==='yes'){ts.push({color:'#3ecf8e',effect:'Comprar TV para camera IA Sorter',cause:'IA Sorter = Sim'});ts.push({color:'#3ecf8e',effect:'Contrato de suporte IA',cause:'IA Sorter = Sim'});}
  if(a.st11==='yes'&&a.et_r==='no'){ts.push({color:'#f59e0b',effect:'ATENÇÃO: IA Sorter requer IVT/Etiquetas — revisar "Etiquetas" (seção 11)',cause:'IA=Sim, Etiquetas=Não'});}
  if(a.pt_ptm==='yes'&&a.pt_ptm_qtd)ts.push({color:'#38bdf8',effect:'Comprar '+a.pt_ptm_qtd+' monitores PTM',cause:'PTM ativo'});
  if(a.pt_tvs_ptl&&parseInt(a.pt_tvs_ptl)>0)ts.push({color:'#38bdf8',effect:'Comprar '+a.pt_tvs_ptl+' monitores PTL',cause:'TVs PTL definidas'});
  if(a.if_titul==='srv_invent'&&a.if_ambientes==='yes')ts.push({color:'#f59e0b',effect:'Verificar custo 2 ambientes Invent no contrato',cause:'Titular Invent + PRD+HML'});
  if(!a.in1||a.in1==='tbd')ts.push({color:'#4a90d9',effect:'Definir protocolo de integracao WCS-WMS',cause:'Tipo integracao indefinido'});
  if(a.st1==='yes'&&(!a.if1||!a.if2))ts.push({color:'#9b82f3',effect:'Preencher detalhes técnicos da Infra',cause:'Sorter confirmado'});
  return ts;
}

function isADefinir(val, qType) {
  if (!val || val === '') return false;
  if (val === 'tbd') return true;
  if (qType === 'multi' && val.split('|||').indexOf('tbd') >= 0) return true;
  if (qType !== 'select' && qType !== 'multi' && /definir/i.test(val)) return true;
  return false;
}

function getADefinir(a, pblLines) {
  var items = [];
  SEC.forEach(function(s) {
    var vis = gv(s, a);
    vis.forEach(function(q) {
      if (isADefinir(a[q.id], q.t)) items.push({ secId: s.id, secLabel: s.t, qId: q.id, qLabel: q.q });
    });
  });
  // PBL lines (stored separately from answers)
  if (pblLines && a.p1 === 'yes') {
    pblLines.forEach(function(line, i) {
      gvPbl(line).forEach(function(q) {
        if (line[q.id] === 'tbd') {
          var linePrefix = pblLines.length > 1 ? 'Linha ' + (i + 1) + ' — ' : '';
          items.push({ secId: 'pb', secLabel: 'PBL / FlowRack', qId: 'pb_l' + i + '_' + q.id, qLabel: linePrefix + q.q });
        }
      });
    });
  }
  return items;
}

// ─── Descriptions (tooltip "i" por pergunta) ──────────────────────────────────
var DESC = {
  // Seção 1 — Info Gerais
  g1:'Razão social ou nome do cliente contratante. Será o identificador principal do projeto.',
  g2:'Código interno do projeto no padrão Invent: I + 2 dígitos + ponto + 3 ou 4 dígitos. Ex: I24.001 ou I24.0001.',
  g_codinome:'Nome de uso do projeto nos documentos e comunicações — geralmente o nome do cliente ou um codinome curto. Ex: PAYLESS, Projeto Colibri.',
  g3:'Cidade e estado do Centro de Distribuição onde o WCS será implantado. Ex: São Paulo, SP.',
  g4:'Indica se é uma implantação nova ou expansão/modificação de sistema WCS já existente no cliente.',
  g4a:'Descreva os módulos ou funcionalidades que serão adicionados ao sistema existente.',
  g5:'Sistema de gestão do armazém do cliente. Pode ser WMS (ex: CONCINCO, TOTVS, Infor), EWM/SAP, ou outros sistemas legados.',
  g_golive:'Data alvo para entrada em produção (Go-Live). Impacta dimensionamento de equipe e cronograma.',
  // Seção 2 — Layout e Caixas
  c2:'Indica se o CD opera com mais de um tipo/tamanho de caixa. Quando sim, permite selecionar múltiplos tipos.',
  l1:'Tipo de embalagem que circulará no sistema (esteira, sorter, PBL). Define dimensionamento dos equipamentos.',
  l1_m:'Selecione todos os tipos de caixa/embalagem que circulam no sistema. Use "A definir" se ainda não está definido.',
  l_esteira:'Presença de esteiras transportadoras (conveyor). Impacta módulos de controle de fluxo do WCS.',
  l3:'Piso elevado no CD para ampliar área de picking. Impacta arquitetura dos módulos por nível.',
  l5:'Número de pavimentos do mezanino (excluindo o térreo). Cada nível pode ter controle independente no WCS.',
  l6:'Robôs Móveis Autônomos (AMR). Indica se o WCS precisa integrar com sistema de AGV/AMR.',
  // Seção 3 — Cubagem
  c1:'Define qual sistema calcula volume e dimensões do pedido para seleção da embalagem correta.',
  // Seção 4 — Order Start
  os_r:'Define qual sistema (WCS ou WMS) emite o comando de início do processo de separação de pedidos.',
  os1:'Número de estações físicas de Order Start no CD. Cada OS é o ponto onde a caixa é associada ao pedido.',
  os_imp_etq:'Define se uma etiqueta de rastreamento é impressa no momento do Order Start.',
  os4:'Método de associar a caixa ao pedido: scanner fixo (instalado na estação) ou manual (coletor portátil).',
  os5:'Indica se cada nível do mezanino possui sua própria estação de Order Start independente.',
  // Seção 5a — PBL
  p1:'PBL (Pick by Light): separação guiada por displays luminosos no FlowRack. Alto giro e alta produtividade.',
  pk_tp:'Volume de caixas processado por hora em cada linha de PBL. Base para dimensionamento de hardware.',
  pk_es:'Define se o WCS controla o estoque nas posições de PBL ou se o WMS centraliza esse controle.',
  // PBL interno (linhas)
  p_r:'Responsabilidade pela gestão das ordens de separação na linha de PBL: WCS ou WMS.',
  p_m:'Método de confirmação do picking: display LED (operador aciona botão) ou leitura de código de barras.',
  p_led:'Tamanho do display LED: 3 dígitos (quantidade pequena) ou 10 dígitos (quantidade maior + informações).',
  p_g:'Perfil de giro dos SKUs nesta linha: Alto giro = mais vendidos; Baixo giro = menor saída.',
  p2:'Número de estações de trabalho (operadores simultâneos) na linha de PBL.',
  p_pdv:'PDV = Ponto de Desvio. Estação onde caixas com problemas são desviadas para tratamento.',
  p_pdv_f:'Responsável pelo fornecimento do equipamento/hardware do Ponto de Desvio.',
  p_sct:'Tipo do leitor de código de barras: de mão (portátil) ou fixo (instalado na bancada/esteira).',
  p_sc_f:'Responsável pelo fornecimento dos scanners/coletores de código de barras.',
  p_pf:'Número de posições de SKU na face frontal do FlowRack (facing para o operador de picking).',
  p_pc:'Número de posições de SKU na face traseira do FlowRack (para reposição de estoque).',
  p10:'Indica se há operação de picking também pela face traseira do FlowRack.',
  p10l:'Se a face de picking traseiro também possui displays LED de guia.',
  p10lt:'Tamanho do display LED na face traseira: 3 ou 10 dígitos.',
  p_re:'Responsável pelo fornecimento do hardware de PBL (displays, controladores, cablagem).',
  s1p:'Se a finalização da coleta (corte da ordem) precisa de validação de um supervisor.',
  s2p:'Se o sistema deve solicitar automaticamente uma nova caixa ao operador ao iniciar a separação.',
  // Seção 5b — Picking Cart
  ct1:'Picking Cart: operador percorre o estoque com carrinho, guiado por PDV ou coletor de dados.',
  ct_r:'Define qual sistema gerencia as rotas e ordens do Picking Cart: WCS ou WMS.',
  ct_qc:'Número total de carrinhos de picking em operação simultânea no CD.',
  ct2:'Número de posições/slots em cada carrinho onde as caixas são alocadas durante a separação.',
  ct_d:'Hardware no carrinho: PDV (monitor touchscreen) ou coletor de dados portátil.',
  ct_df:'Responsável pelo fornecimento dos dispositivos instalados nos carrinhos.',
  ct6:'Destino do carrinho/caixa após completar a separação: PBL (completa), Conferência ou Packing.',
  s1c:'Se a finalização da coleta com o carrinho precisa de aprovação de supervisor.',
  s2c:'Se o sistema solicita nova caixa ao operador ao iniciar separação com o carrinho.',
  // Seção 5c — Full Case
  fc1:'Full Case: separação de pedidos em caixa fechada (sem abrir embalagem do fornecedor). Alto volume.',
  fc_r:'Define qual sistema gerencia o processo de separação Full Case: WCS, WMS ou ambos.',
  fc2:'Método de operação do Full Case quando gerenciado pelo WCS.',
  fc2b:'Método de operação do Full Case quando gerenciado por ambos (WCS + WMS).',
  fc_i:'Se há impressora de etiquetas dedicada ao processo de Full Case.',
  fc_if:'Responsável pelo fornecimento da impressora do Full Case.',
  fc_re:'Responsável pelo fornecimento do hardware do processo Full Case.',
  fc_qe:'Quantidade de equipamentos (coletores/PDVs) utilizados no Full Case.',
  // Seção 9 — Conferência & Packing
  cf_gate:'Define se existe processo de conferência de caixas neste CD.',
  cf_t1:'Método de conferência das caixas desviadas: cega (sem ver o pedido), item a item, multiplicador ou EAN.',
  cf2:'Número de estações físicas de conferência instaladas no CD.',
  cf_t2:'Critérios que acionam desvio para conferência: peso, RFID, amostragem, por cliente/produto ou 100%.',
  cf4:'Variação de peso aceita antes de acionar o desvio para conferência. Ex: ±50g.',
  // Seção 8 — Packing
  pk1:'Estação de embalagem/fechamento das caixas antes da expedição (lacre, NF, endereçamento).',
  pk_auto:'Se o packing usa equipamento automatizado (void fill automático, fechadora de caixa).',
  pk_imp:'Se há impressora de etiquetas/NF na estação de packing.',
  pk_imp_f:'Responsável pelo fornecimento da impressora da estação de packing.',
  pk_imp_t:'Como a impressão é disparada: manualmente pelo operador ou automaticamente pelo sistema.',
  pk_troca:'Se o operador pode trocar a caixa do pedido na estação de packing (ex: caixa superdimensionada).',
  pk_etiq:'Se o operador pode reemitir/trocar a etiqueta da caixa na estação de packing.',
  // Seção 9 — Sorter
  st1:'Sorter: sistema automatizado de triagem e direcionamento de volumes para rampas de destino. Alto custo/produtividade.',
  st2:'Número de rampas (chutes) de saída do Sorter. Cada rampa = um destino (região, transportadora, filial).',
  st3:'Rampas destinadas a volumes rejeitados (não reconhecidos ou com falha de leitura).',
  st_cap:'Volume máximo de processamento do Sorter por hora. Parâmetro de contrato e dimensionamento.',
  st4:'Tempo máximo entre entrada do volume no portal do Sorter e o primeiro despacho de alta prioridade (HPD).',
  st5:'Tipo/número de estações de entrada (indução) onde os volumes são posicionados na esteira do Sorter.',
  st6:'Número de faces do leitor de código de barras no portal de entrada do Sorter (1 a 6 faces).',
  st_criterio:'Critério para direcionar volumes às rampas: região geográfica, transportadora ou filial/destino.',
  st7:'Verificação cruzada para confirmar que o código foi lido corretamente antes de desviar o volume.',
  st10:'Dispositivo visual nas rampas (semáforo) indicando status: disponível, quase cheia, cheia.',
  st11:'Câmera com IA integrada ao Sorter para leitura de volumes sem código de barras ou com código danificado.',
  st11_tvs:'Quantidade de monitores/TVs dedicados à câmera IA do Sorter (exibição de imagem e status em tempo real).',
  st_rc:'Se o Sorter tem esteira de recirculação para reprocessar volumes não lidos ou não alocados.',
  st_ag:'Critério de agrupamento de volumes dentro de uma mesma rampa (por NF, pedido, transportadora).',
  // Seção 10 — Palletização & PTL
  pt1:'Método de montagem de pallets na expedição: PTL (Put to Light), PTM (Put to Monitor), Alocação ou sem.',
  pt3:'Número de posições de pallet disponíveis na área de expedição do CD.',
  pt_frag:'Se o WCS aplica regras de empilhamento baseadas na fragilidade (pesados embaixo, frágeis em cima).',
  pt_ag:'Critério de agrupamento de volumes em um pallet (ex: por transportadora, região, nota fiscal).',
  pt8:'Presença de produtos com restrições de transporte (químicos, inflamáveis). Requer tratamento especial.',
  pt9:'Se o WCS gera documento de romaneio (lista de conteúdo do pallet) no momento da expedição.',
  pt_tem_ptl:'PTL (Put to Light): displays nas posições de pallet que indicam ao operador onde colocar cada volume.',
  pt_tipo_disp:'Hardware do PTL: display físico (LEDs) instalado na prateleira, ou tablet fixo na posição.',
  pt_tvs_ptl:'Número de monitores/TVs usados no sistema PTL para exibição de informações de posição.',
  pt_ptm:'PTM (Put to Monitor): monitor central indica ao operador qual posição de pallet recebe o próximo volume.',
  pt_ptm_qtd:'Número de monitores utilizados no sistema PTM.',
  // Seção 11 — Gestão de Estoque
  es1:'Define se o WCS é responsável pelo controle de estoque em tempo real, ou se isso é papel do WMS.',
  es2:'Se o WCS solicita automaticamente reabastecimento quando estoque de picking atinge o mínimo.',
  es3:'Se o reabastecimento das posições de picking é feito com auxílio do Sorter (inbound direto ao picking).',
  es4:'Se o WCS suporta processo de inventário rotativo ou cíclico das posições.',
  es5:'Se o WCS suporta Recall: localizar e bloquear lotes/produtos com problemas de qualidade.',
  es6:'Se o sistema permite movimentação forçada de estoque (fora do fluxo normal) por usuários autorizados.',
  es7:'Classificação de SKUs por velocidade de saída: A=alto giro, B=médio, C=baixo. Impacta endereçamento.',
  es8:'Período em dias do histórico de saída para calcular a Curva ABC. Ex: 30, 60 ou 90 dias.',
  es10:'Verificação dupla de picking: dois operadores conferem independentemente antes de fechar a caixa.',
  // Seção 12 — Etiquetas
  et_r:'Define se o WCS ou o WMS é responsável pela geração e impressão das etiquetas dos volumes.',
  et1:'Total de impressoras de etiquetas instaladas em todo o CD.',
  et_dist:'Como as impressoras estão distribuídas no CD. Ex: 2 no PBL, 1 no Packing, 1 no Order Start.',
  // Seção 13 — Integração
  in1:'Protocolo de comunicação WCS↔WMS/ERP: REST API, IDoc (SAP), DBLink (banco direto), Excel ou JSON.',
  in_resp:'Quem desenvolve e mantém a integração entre WCS e WMS/ERP: Invent, Cliente ou ambos.',
  in_endpoint:'URL base da API de integração do WMS/ERP para configuração no WCS.',
  in3:'Tempo máximo (ms) de espera por resposta da API antes de abortar a chamada. Ex: 5000.',
  // Seção 14 — Infraestrutura
  if_titul:'Responsável pelos servidores: Invent (cloud/SaaS), Cliente (on-premise) ou compartilhado.',
  if_ambiente:'Modelo de deploy do WCS: On-premise (servidores no CD), SaaS, Cloud ou Híbrido.',
  if_s:'Produção e homologação no mesmo servidor (único) ou em máquinas separadas.',
  if_ambientes:'Se o projeto inclui dois ambientes distintos: Produção (PRD) e Homologação (HML).',
  if_focal:'Nome e contato do responsável técnico de TI no cliente para alinhamentos de infraestrutura.',
  if_data_infra:'Data em que o cliente entregará o ambiente para instalação do WCS. Formato: DD/MM/AAAA.',
  if1:'Sistema operacional dos servidores onde o WCS será instalado.',
  if2:'Banco de dados utilizado pelo WCS: SQL Server, PostgreSQL, Oracle ou MySQL.',
  if3:'VLAN dedicada para o WCS, separada da rede corporativa do cliente. Melhora segurança e latência.',
  if4:'Acesso VPN para manutenção remota do WCS pela equipe da Invent.',
  if5:'Número de estações de trabalho (PCs/terminais) que acessarão a interface do WCS.',
  if6:'Acesso à internet nas máquinas do WCS. Necessário para atualizações remotas e suporte técnico.',
  if7:'Especificações técnicas dos servidores (CPU, RAM, disco) para validar requisitos mínimos do WCS.',
  if8:'Integração com Active Directory (AD) ou Single Sign-On (SSO) do cliente para autenticação.',
  if9:'Controlador Lógico Programável para integração com equipamentos físicos (esteiras, sorters).',
  if10:'Política de backup dos dados e configurações do WCS definida com o cliente.',
};

// ─── Input masks ──────────────────────────────────────────────────────────────
var MASKED = { g2:'project_code', if_data_infra:'date' };
var NUM_FIELDS = new Set([]);

function applyDateMask(v) {
  var d = v.replace(/\D/g,'');
  if(d.length<=2) return d;
  if(d.length<=4) return d.slice(0,2)+'/'+d.slice(2);
  return d.slice(0,2)+'/'+d.slice(2,4)+'/'+d.slice(4,8);
}
function applyProjectCodeMask(v) {
  var s = v.toUpperCase().replace(/[^I0-9]/g,'');
  if(!s.startsWith('I')) s = 'I' + s.replace(/I/g,'');
  var digits = s.slice(1).replace(/\./g,'');
  if(digits.length<=2) return 'I'+digits;
  return 'I'+digits.slice(0,2)+'.'+digits.slice(2,6);
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        Confirmar acao
        <IconButton size="small" onClick={onCancel}><CloseRoundedIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: 'text.primary' }}>{msg}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit" size="small">Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="error" size="small">Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── QF (Question Field) ──────────────────────────────────────────────────────
function QF({ q, v, ch, a, qid }) {
  if(q.d) { var p=q.d.split(':'); if(a[p[0]]!==p[1]) return null; }
  var borderLeft = q.g ? `3px solid ${Y}` : 'none';
  var pl = q.g ? 1.5 : 0;
  var mask = MASKED[q.id] || null;
  var isTbd = isADefinir(v, q.t);
  var tbdInputSx = isTbd ? {'& .MuiInputBase-input':{color:Y}} : {};
  var maskPh = mask==='date' ? 'DD/MM/AAAA' : mask==='project_code' ? 'I24.001' : (q.p||'');
  function handleMasked(e) {
    var raw = e.target.value;
    var val = mask==='date' ? applyDateMask(raw) : mask==='project_code' ? applyProjectCodeMask(raw) : raw;
    ch(q.id, val);
  }
  return (
    <Box id={"qf-" + (qid || q.id)} sx={{ py: '7px', borderLeft, pl }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:'4px', mb:'5px' }}>
        <Typography sx={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'text.secondary' }}>
          {q.q}
        </Typography>
        {DESC[q.id] && (
          <Tooltip title={DESC[q.id]} placement="right" arrow>
            <InfoOutlinedIcon sx={{ fontSize:13, color:'text.disabled', cursor:'help', flexShrink:0, '&:hover':{color:'primary.main'} }} />
          </Tooltip>
        )}
      </Box>

      {q.t === 'text' && !NUM_FIELDS.has(q.id) && (
        <TextField fullWidth size="small" value={v||''} onChange={mask ? handleMasked : function(e){ch(q.id,e.target.value)}} placeholder={maskPh} sx={tbdInputSx} />
      )}
      {q.t === 'text' && NUM_FIELDS.has(q.id) && (
        <TextField
          fullWidth size="small"
          value={v||''}
          onChange={function(e){ch(q.id,e.target.value);}}
          type="number"
          sx={{
            '& input::-webkit-outer-spin-button,& input::-webkit-inner-spin-button':{ WebkitAppearance:'none', margin:0 },
            '& input[type=number]':{ MozAppearance:'textfield' },
          }}
          InputProps={{
            endAdornment:(
              <InputAdornment position="end" sx={{ ml:0.5, mr:-0.5 }}>
                <Box sx={{ display:'flex', flexDirection:'column' }}>
                  {[1,-1].map(function(delta){return(
                    <Box
                      key={delta}
                      component="button"
                      type="button"
                      tabIndex={-1}
                      onClick={function(){var n=(Number(v)||0)+delta;ch(q.id,String(n<0?0:n));}}
                      sx={{
                        width:17, height:13, p:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        bgcolor:'transparent',
                        border:'1px solid', borderColor:'divider',
                        borderTop: delta===-1 ? 'none' : undefined,
                        borderRadius: delta===1 ? '0 3px 0 0' : '0 0 3px 0',
                        cursor:'pointer', color:'text.disabled', lineHeight:1,
                        '&:hover':{ color:'primary.main', bgcolor:'rgba(255,197,0,0.08)' },
                      }}
                    >
                      <Typography sx={{ fontSize:8, lineHeight:1, userSelect:'none', pointerEvents:'none' }}>
                        {delta===1?'▲':'▼'}
                      </Typography>
                    </Box>
                  );})}
                </Box>
              </InputAdornment>
            ),
          }}
        />
      )}
      {q.t === 'textarea' && (
        <TextField fullWidth size="small" multiline minRows={2} value={v||''} onChange={function(e){ch(q.id,e.target.value)}} placeholder={q.p||''} sx={tbdInputSx} />
      )}
      {q.t === 'select' && (
        <Select fullWidth size="small" displayEmpty value={v||''} onChange={function(e){ch(q.id,e.target.value)}} sx={isTbd ? {'& .MuiSelect-select':{color:Y}} : {}}>
          <MenuItem value=""><em style={{color:'#666'}}>--</em></MenuItem>
          {(q.o||[]).map(function(ov){return <MenuItem key={ov} value={ov} sx={ov==='tbd'?{color:Y}:{}}>{to(ov)}</MenuItem>;})}
        </Select>
      )}
      {q.t === 'wms' && (
        <Box>
          <TextField
            fullWidth size="small"
            value={v||''}
            onChange={function(e){ch(q.id,e.target.value);saveCustomWms(e.target.value);}}
            placeholder="Ex: CONCINCO"
            inputProps={{ list:'wms-datalist' }}
            sx={tbdInputSx}
          />
          <datalist id="wms-datalist">{getWmsList().map(function(w){return <option key={w} value={w}/>;})}</datalist>
          <Typography sx={{ fontSize:10, color:'text.disabled', mt:'3px' }}>Não encontrou? Digite para adicionar automaticamente.</Typography>
        </Box>
      )}
      {q.t === 'multi' && (
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {(q.o||[]).map(function(ov){
            var vs = v ? v.split('|||') : [];
            var ck = vs.indexOf(ov) >= 0;
            return (
              <Paper key={ov} elevation={0} sx={{ px:1.25, py:'8px', bgcolor: ck ? 'rgba(255,197,0,0.08)' : '#2e2e2e', borderColor: ck ? 'rgba(255,197,0,0.3)' : 'divider', cursor:'pointer', transition:'.15s' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ck}
                      onChange={function(){var nv=ck?vs.filter(function(x){return x!==ov;}):vs.concat([ov]);ch(q.id,nv.join('|||'));}}
                      sx={{ color:'divider', '&.Mui-checked':{color:'primary.main'}, p:0, mr:1 }}
                    />
                  }
                  label={<Typography sx={{ fontSize:13, color: ck ? 'primary.main' : 'text.secondary', fontWeight: ck ? 600 : 400 }}>{to(ov)}</Typography>}
                  sx={{ m:0, width:'100%' }}
                />
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

// ─── OSDevices ────────────────────────────────────────────────────────────────
function OSDevices({ devices, setDevices }) {
  var ddiState = useState(null), delDevIdx = ddiState[0], setDelDevIdx = ddiState[1];
  var add = function(){setDevices(function(p){return p.concat({type:'',qty:'',resp:''});});};
  var confirmRemove = function(){setDevices(function(p){return p.filter(function(_,idx){return idx!==delDevIdx;});});setDelDevIdx(null);};
  var upd = function(i,field,val){setDevices(function(p){var n=p.slice();n[i]=Object.assign({},n[i]);n[i][field]=val;return n;});};
  return (
    <Box sx={{ borderTop:'1px solid', borderColor:'divider', pt:1.5, mt:0.5 }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography sx={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'text.secondary' }}>Dispositivos / Equipamentos</Typography>
        <Button size="small" variant="contained" color="primary" onClick={add} sx={{ fontSize:11, minHeight:0, py:0.5 }}>+ Adicionar</Button>
      </Box>
      {devices.length === 0 && <Typography sx={{ fontSize:12, color:'text.disabled', fontStyle:'italic', mb:1 }}>Nenhum dispositivo adicionado</Typography>}
      <Stack spacing={0.75}>
        {devices.map(function(d,i){return (
          <Paper key={i} elevation={0} sx={{ p:1.25, bgcolor:'background.default' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:0.75, mb:0.75 }}>
              <TextField fullWidth size="small" value={d.type||''} onChange={function(e){upd(i,'type',e.target.value);}} placeholder="Equipamento (ex: Impressora Zebra ZD420)" />
              <Tooltip title="Remover dispositivo">
                <IconButton size="small" onClick={function(){setDelDevIdx(i);}} sx={{ color:'text.disabled', '&:hover':{ color:'error.main' }, flexShrink:0 }}>
                  <CloseRoundedIcon sx={{ fontSize:15 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Stack direction="row" spacing={0.75}>
              <TextField size="small" value={d.qty||''} onChange={function(e){upd(i,'qty',e.target.value);}} placeholder="Quantidade" sx={{ flex:1 }} />
              <Select size="small" value={d.resp||''} onChange={function(e){upd(i,'resp',e.target.value);}} displayEmpty sx={{ flex:1 }}>
                <MenuItem value=""><em style={{color:'#666'}}>Responsável</em></MenuItem>
                <MenuItem value="invent">Invent</MenuItem>
                <MenuItem value="client">Cliente</MenuItem>
                <MenuItem value="both_resp">Ambos</MenuItem>
              </Select>
            </Stack>
          </Paper>
        );})}
      </Stack>
      <Dialog open={delDevIdx !== null} onClose={function(){setDelDevIdx(null);}} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          Remover dispositivo
          <IconButton size="small" onClick={function(){setDelDevIdx(null);}}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize:14 }}>Remover o dispositivo <Box component="span" sx={{ fontWeight:700, color:'primary.main' }}>"{devices[delDevIdx]?.type||'sem nome'}"</Box>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={function(){setDelDevIdx(null);}} color="inherit" size="small">Cancelar</Button>
          <Button onClick={confirmRemove} variant="contained" color="error" size="small">Remover</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── MezDetails ───────────────────────────────────────────────────────────────
function MezDetails({ n, details, setDetails }) {
  return (
    <Box sx={{ borderTop:'1px solid', borderColor:'divider', pt:1.5, mt:0.5 }}>
      <Typography sx={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'text.secondary', mb:1 }}>Detalhe por nível de mezanino</Typography>
      <Stack spacing={0.75}>
        {Array.from({length:n}).map(function(_,i){return (
          <Box key={i}>
            <Typography sx={{ fontSize:11, color:'text.disabled', mb:'3px' }}>Nível {i+1}</Typography>
            <TextField
              fullWidth size="small"
              value={details[i]||''}
              onChange={function(e){setDetails(function(p){var nd=p.slice();while(nd.length<=i)nd.push('');nd[i]=e.target.value;return nd;});}}
              placeholder={'Descrição do nível '+(i+1)}
            />
          </Box>
        );})}
      </Stack>
    </Box>
  );
}

// ─── OsDetails ────────────────────────────────────────────────────────────────
function OsDetails({ n, details, setDetails }) {
  return (
    <Box sx={{ borderTop:'1px solid', borderColor:'divider', pt:1.5, mt:0.5 }}>
      <Typography sx={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'text.secondary', mb:1 }}>Detalhe por Order Start</Typography>
      <Stack spacing={0.75}>
        {Array.from({length:n}).map(function(_,i){return (
          <Box key={i}>
            <Typography sx={{ fontSize:11, color:'text.disabled', mb:'3px' }}>OS {i+1}</Typography>
            <TextField
              fullWidth size="small"
              value={details[i]||''}
              onChange={function(e){setDetails(function(p){var nd=p.slice();while(nd.length<=i)nd.push('');nd[i]=e.target.value;return nd;});}}
              placeholder={'Descrição do OS '+(i+1)+' (ex: Endereçamento, local, tipo)'}
            />
          </Box>
        );})}
      </Stack>
    </Box>
  );
}

// ─── EtiquetasEditor ──────────────────────────────────────────────────────────
function EtiquetasEditor({ etiquetas, setEtiquetas }) {
  var deState = useState(null), delEtqIdx = deState[0], setDelEtqIdx = deState[1];
  var dfState = useState(null), delField = dfState[0], setDelField = dfState[1];
  var addEtq = function(){setEtiquetas(function(p){return p.concat({name:'',size:'',fields:[]});});};
  var confirmRemoveEtq = function(){setEtiquetas(function(p){return p.filter(function(_,idx){return idx!==delEtqIdx;});});setDelEtqIdx(null);};
  var updEtq = function(i,field,val){setEtiquetas(function(p){var n=p.slice();n[i]=Object.assign({},n[i]);n[i][field]=val;return n;});};
  var addField = function(i){setEtiquetas(function(p){var n=p.slice();n[i]=Object.assign({},n[i],{fields:(n[i].fields||[]).concat({name:'',isCode:false,codeType:''})});return n;});};
  var confirmRemoveField = function(){setEtiquetas(function(p){var n=p.slice();n[delField.i]=Object.assign({},n[delField.i],{fields:n[delField.i].fields.filter(function(_,idx){return idx!==delField.j;})});return n;});setDelField(null);};
  var updField = function(i,j,field,val){setEtiquetas(function(p){var n=p.slice();var fs=n[i].fields.slice();fs[j]=Object.assign({},fs[j]);fs[j][field]=val;n[i]=Object.assign({},n[i],{fields:fs});return n;});};
  return (
    <Box sx={{ borderTop:'1px solid', borderColor:'divider', pt:1.5, mt:0.5 }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography sx={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', color:'text.secondary' }}>Etiquetas customizadas</Typography>
        <Button size="small" variant="contained" color="primary" onClick={addEtq} sx={{ fontSize:11, minHeight:0, py:0.5 }}>+ Etiqueta</Button>
      </Box>
      {etiquetas.length === 0 && <Typography sx={{ fontSize:12, color:'text.disabled', fontStyle:'italic', mb:1 }}>Nenhuma etiqueta adicionada</Typography>}
      <Stack spacing={1}>
        {etiquetas.map(function(etq,i){return (
          <Paper key={i} elevation={0} sx={{ p:1.5, bgcolor:'background.default' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:1 }}>
              <TextField size="small" value={etq.name||''} onChange={function(e){updEtq(i,'name',e.target.value);}} placeholder="Nome da etiqueta" sx={{ flex:1, '& input':{color:'primary.main',fontWeight:600} }} />
              <TextField size="small" value={etq.size||''} onChange={function(e){updEtq(i,'size',e.target.value);}} placeholder="Ex: 50x100mm" sx={{ width:130 }} />
              <Tooltip title="Remover etiqueta"><IconButton size="small" onClick={function(){setDelEtqIdx(i);}} sx={{ color:'text.disabled', '&:hover':{ color:'error.main' } }}><CloseRoundedIcon sx={{ fontSize:14 }} /></IconButton></Tooltip>
            </Stack>
            <Box sx={{ ml:1, borderLeft:'2px solid', borderColor:'divider', pl:1.25 }}>
              <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:'5px' }}>
                <Typography sx={{ fontSize:10, color:'text.disabled' }}>Campos</Typography>
                <Button size="small" variant="text" onClick={function(){addField(i);}} sx={{ fontSize:11, minHeight:0, py:0 }}>+ Campo</Button>
              </Box>
              <Stack spacing={0.75}>
                {(etq.fields||[]).map(function(f,j){return (
                  <Stack key={j} direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                    <TextField size="small" value={f.name||''} onChange={function(e){updField(i,j,'name',e.target.value);}} placeholder="Nome do campo" sx={{ flex:1, minWidth:90 }} />
                    <FormControlLabel
                      control={<Checkbox size="small" checked={!!f.isCode} onChange={function(e){updField(i,j,'isCode',e.target.checked);}} sx={{ p:0, mr:0.5, '&.Mui-checked':{color:'primary.main'} }} />}
                      label={<Typography sx={{ fontSize:11, color: f.isCode ? 'primary.main' : 'text.secondary' }}>Codigo</Typography>}
                      sx={{ m:0 }}
                    />
                    {f.isCode && <TextField size="small" value={f.codeType||''} onChange={function(e){updField(i,j,'codeType',e.target.value);}} placeholder="EAN128" sx={{ width:100 }} />}
                    <Tooltip title="Remover campo"><IconButton size="small" onClick={function(){setDelField({i:i,j:j});}} sx={{ color:'text.disabled', '&:hover':{ color:'error.main' } }}><CloseRoundedIcon sx={{ fontSize:13 }} /></IconButton></Tooltip>
                  </Stack>
                );})}
              </Stack>
            </Box>
          </Paper>
        );})}
      </Stack>
      <Dialog open={delEtqIdx !== null} onClose={function(){setDelEtqIdx(null);}} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          Remover etiqueta
          <IconButton size="small" onClick={function(){setDelEtqIdx(null);}}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize:14 }}>Remover a etiqueta <Box component="span" sx={{ fontWeight:700, color:'primary.main' }}>"{etiquetas[delEtqIdx]?.name||'sem nome'}"</Box> e todos os seus campos?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={function(){setDelEtqIdx(null);}} color="inherit" size="small">Cancelar</Button>
          <Button onClick={confirmRemoveEtq} variant="contained" color="error" size="small">Remover</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!delField} onClose={function(){setDelField(null);}} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          Remover campo
          <IconButton size="small" onClick={function(){setDelField(null);}}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize:14 }}>Remover o campo <Box component="span" sx={{ fontWeight:700, color:'primary.main' }}>"{delField && etiquetas[delField.i]?.fields[delField.j]?.name || 'sem nome'}"</Box>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={function(){setDelField(null);}} color="inherit" size="small">Cancelar</Button>
          <Button onClick={confirmRemoveField} variant="contained" color="error" size="small">Remover</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── PBLLine ──────────────────────────────────────────────────────────────────
function PBLLine({ idx, line, setLine, onRemove }) {
  var showOptState = useState(false), showOpt = showOptState[0], setShowOpt = showOptState[1];
  var lch = function(id,v){setLine(function(l){var n=Object.assign({},l);n[id]=v;return n;});};
  var vis = gvPbl(line);
  var eq = vis.filter(function(q){return q.e;});
  var oq = vis.filter(function(q){return !q.e;});
  var filled = vis.filter(function(q){return line[q.id]&&line[q.id]!=='';}).length;
  return (
    <Paper elevation={0} sx={{ borderRadius:2, mt:1.25, bgcolor:'#2e2e2e' }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:1.75, py:1.25, borderBottom:'1px solid', borderColor:'divider' }}>
        <Typography sx={{ fontWeight:700, fontSize:13, color:'primary.main' }}>Linha {idx+1}</Typography>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Typography sx={{ fontSize:10, color:'text.disabled', fontFamily:'monospace' }}>{filled}/{vis.length}</Typography>
          {idx > 0 && <Tooltip title="Remover linha"><IconButton size="small" onClick={onRemove} sx={{ color:'text.disabled' }}><CloseRoundedIcon sx={{ fontSize:14 }} /></IconButton></Tooltip>}
        </Stack>
      </Box>
      <Box sx={{ px:1.75, pt:0.5, pb:1.5 }}>
        {eq.map(function(q){return <QF key={q.id} qid={"pb_l"+idx+"_"+q.id} q={q} v={line[q.id]} ch={lch} a={line}/>;  })}
        {oq.length > 0 && (
          <Box sx={{ mt:1 }}>
            <Box
              component="button"
              onClick={function(){setShowOpt(function(p){return !p;});}}
              sx={{
                width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                bgcolor:'transparent', border:'1px solid', borderColor:'divider', borderRadius:1,
                cursor:'pointer', px:1.5, py:0.75, color:'text.secondary',
                '&:hover':{ borderColor:'rgba(255,197,0,0.4)', color:'primary.main' }, transition:'.15s',
              }}
            >
              <Typography sx={{ fontSize:12, fontWeight:600 }}>
                {showOpt ? 'Ocultar opcionais' : 'Ver Opcionais ('+oq.length+')'}
              </Typography>
              <KeyboardArrowDownRoundedIcon sx={{ fontSize:16, transform: showOpt ? 'rotate(180deg)' : 'none', transition:'transform .2s' }} />
            </Box>
            {showOpt && (
              <Box sx={{ mt:1, ml:1, borderLeft:'2px solid', borderColor:'divider', pl:1.5 }}>
                {oq.map(function(q){return <QF key={q.id} qid={"pb_l"+idx+"_"+q.id} q={q} v={line[q.id]} ch={lch} a={line}/>;  })}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// ─── PBLCard ──────────────────────────────────────────────────────────────────
function PBLCard({ a, ch, pblLines, setPblLines }) {
  var dlState = useState(null), delLineIdx = dlState[0], setDelLineIdx = dlState[1];
  var hasPbl = a.p1 === 'yes';
  var addLine = function(){setPblLines(function(p){return p.concat([{}]);});};
  var confirmRemoveLine = function(){setPblLines(function(p){return p.filter(function(_,idx){return idx!==delLineIdx;});});setDelLineIdx(null);};
  var setLine = function(i,fn){setPblLines(function(p){var n=p.slice();n[i]=fn(n[i]);return n;});};
  return (
    <Box>
      <QF q={GATE_PBL} v={a.p1} ch={ch} a={a} />
      {hasPbl && (
        <Box sx={{ mt:1 }}>
          {pblLines.map(function(line,i){return <PBLLine key={i} idx={i} line={line} setLine={function(fn){setLine(i,fn);}} onRemove={function(){setDelLineIdx(i);}}/>;  })}
          <Button
            fullWidth variant="outlined" color="primary"
            onClick={addLine}
            sx={{ mt:1.25, borderStyle:'dashed', fontSize:13, fontWeight:600 }}
          >
            + Linha PBL
          </Button>
        </Box>
      )}
      <Dialog open={delLineIdx !== null} onClose={function(){setDelLineIdx(null);}} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          Remover linha PBL
          <IconButton size="small" onClick={function(){setDelLineIdx(null);}}><CloseRoundedIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize:14 }}>Remover a Linha {delLineIdx !== null ? delLineIdx + 1 : ''} do PBL? Os dados desta linha serão perdidos.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={function(){setDelLineIdx(null);}} color="inherit" size="small">Cancelar</Button>
          <Button onClick={confirmRemoveLine} variant="contained" color="error" size="small">Remover</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── ExportModal ──────────────────────────────────────────────────────────────
function ExportModal({ exM, setExM, cpRef }) {
  var fmtState = useState('json'), fmt = fmtState[0], setFmt = fmtState[1];
  var pendModeState = useState('empty'), pendMode = pendModeState[0], setPendMode = pendModeState[1];
  var cpdState = useState(false), cpd = cpdState[0], setCpd = cpdState[1];
  var hasDual = exM.jTbd !== undefined;
  var curJ = hasDual && pendMode==='tbd' ? exM.jTbd : exM.j;
  var curM = hasDual && pendMode==='tbd' ? exM.mTbd : exM.m;
  var doCp = function(){try{cpRef.current.focus();cpRef.current.select();document.execCommand('copy');setCpd(true);setTimeout(function(){setCpd(false);},2000);}catch(e){}};
  var doDown = function(){var content=fmt==='json'?JSON.stringify(curJ,null,2):curM;var mime=fmt==='json'?'application/json':'text/markdown';var ext=fmt==='json'?'.json':'.md';var proj=exM.slug||'Nexus_Kickoff';var blob=new Blob([content],{type:mime});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=proj+ext;a.click();URL.revokeObjectURL(url);};
  return (
    <Dialog open onClose={function(){setExM(null);}} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', color:'primary.main' }}>
        {exM.t}
        <IconButton size="small" onClick={function(){setExM(null);}}><CloseRoundedIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pb:0 }}>
        {hasDual && (
          <Stack direction="row" spacing={1} sx={{ mb:1 }}>
            <Button size="small" variant={pendMode==='empty'?'contained':'outlined'} onClick={function(){setPendMode('empty');}} sx={{ fontSize:12 }}>Não preenchido</Button>
            <Button size="small" variant={pendMode==='tbd'?'contained':'outlined'} onClick={function(){setPendMode('tbd');}} sx={{ fontSize:12 }}>A Definir</Button>
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{ mb:1.5 }}>
          <Button size="small" variant={fmt==='json'?'contained':'outlined'} onClick={function(){setFmt('json');}} sx={{ fontSize:12 }}>JSON</Button>
          <Button size="small" variant={fmt==='md'?'contained':'outlined'} onClick={function(){setFmt('md');}} sx={{ fontSize:12 }}>MD</Button>
        </Stack>
        <Box
          component="textarea"
          ref={cpRef}
          readOnly
          value={fmt==='json'?JSON.stringify(curJ,null,2):curM}
          sx={{
            width:'100%', height:220, bgcolor:'background.default',
            color:'text.secondary', fontSize:11, fontFamily:'monospace',
            borderRadius:1, p:1.25, border:'1px solid', borderColor:'divider',
            resize:'none', outline:'none', boxSizing:'border-box',
          }}
        />
      </DialogContent>
      <DialogActions sx={{ gap: 0.5 }}>
        <Button onClick={function(){setExM(null);}} color="inherit" size="small">Fechar</Button>
        <Box sx={{ flex:1 }} />
        <Button
          onClick={doCp}
          variant={cpd ? 'outlined' : 'contained'}
          size="small"
          color={cpd ? 'success' : 'primary'}
          sx={{ minWidth:90, fontWeight:700 }}
        >
          {cpd ? '✓ Copiado!' : 'Copiar'}
        </Button>
        <Button
          onClick={doDown}
          variant="contained"
          size="small"
          color="primary"
          startIcon={<DownloadRoundedIcon />}
          sx={{ fontWeight:700 }}
        >
          Baixar {fmt === 'json' ? 'JSON' : 'MD'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── KickoffPage ──────────────────────────────────────────────────────────────
export function KickoffPage({ onNavigate, projectId, onProjectSaved, isFullscreen, onToggleFullscreen }) {
  var saState = useState({}), a = saState[0], setA = saState[1];
  var snState = useState({}), nt = snState[0], setN = snState[1];
  var soState = useState({}), so = soState[0], setSo = soState[1];
  var exMState = useState(null), exM = exMState[0], setExM = exMState[1];
  var cmState = useState(null), confirmModal = cmState[0], setConfirmModal = cmState[1];
  var plState = useState([{}]), pblLines = plState[0], setPblLines = plState[1];
  var odState = useState([]), osDevices = odState[0], setOsDevices = odState[1];
  var osdState = useState([]), osDetailsList = osdState[0], setOsDetailsList = osdState[1];
  var mdState = useState([]), mezDetails = mdState[0], setMezDetails = mdState[1];
  var etqState = useState([]), etiquetas = etqState[0], setEtiquetas = etqState[1];
  var sqState = useState(''), search = sqState[0], setSearch = sqState[1];
  var csState = useState('ge'), curSec = csState[0], setCurSec = csState[1];
  var adcState = useState(true), aDefCollapsed = adcState[0], setADefCollapsed = adcState[1];
  var rcState = useState(false), rightCollapsed = rcState[0], setRightCollapsed = rcState[1];
  var cpState = useState({ph1:true,ph2:true,ph3:true}), collPhases = cpState[0], setCollPhases = cpState[1];
  var pidState = useState(projectId || null), pid = pidState[0], setPid = pidState[1];
  var pScrollState = useState(null), pendingScrollQId = pScrollState[0], setPendingScrollQId = pScrollState[1];
  var spState = useState(''), scratchpad = spState[0], setScratchpad = spState[1];
  var mnState = useState(''), meetingNotes = mnState[0], setMeetingNotes = mnState[1];
  var mnoState = useState(function(){ try{ var v=localStorage.getItem('nexus_kickoff_mno'); return v===null?true:v==='1'; }catch{ return true; } }), meetingNotesOpen = mnoState[0], setMeetingNotesOpen = mnoState[1];
  var si1bState = useState(false), showIn1b = si1bState[0], setShowIn1b = si1bState[1];
  var fr = useRef(), cpRef = useRef();

  // Sync meetingNotesOpen from localStorage on mount and on HMR (Fast Refresh re-runs effects)
  useEffect(function() {
    try { var v=localStorage.getItem('nexus_kickoff_mno'); setMeetingNotesOpen(v===null?true:v==='1'); } catch {}
  }, []);

  // Load project data when projectId changes
  useEffect(function() {
    if (!projectId) return;
    var p = loadProject(projectId);
    if (!p) return;
    var ans = Object.assign({}, p.answers || {});
    if (!ans.g1 && p.client) ans.g1 = p.client;
    if (!ans.g_codinome && p.name && p.name !== p.client) ans.g_codinome = p.name;
    setA(ans);
    setN(p.notes || {});
    setPblLines(p.pblLines && p.pblLines.length ? p.pblLines : [{}]);
    setOsDevices(p.osDevices || []);
    setOsDetailsList(p.osDetails || []);
    setMezDetails(p.mezDetails || []);
    setEtiquetas(p.etiquetas || []);
    setScratchpad(p.scratchpad || '');
    setMeetingNotes(p.meetingNotes || '');
    setShowIn1b(!!(p.answers && p.answers['in1b']));
    setPid(projectId);
  }, [projectId]);

  // Auto-save debounced (1s) when data changes and project is open
  var autoSaveRef = useRef(null);
  useEffect(function() {
    if (!pid) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(function() {
      var existing = loadProject(pid);
      if (!existing) return;
      upsertProject(Object.assign({}, existing, {
        client: a.g1 || existing.client || 'Sem cliente',
        name: a.g_codinome || a.g2 || a.g1 || existing.name || 'Kickoff',
        answers: a, notes: nt, pblLines: pblLines,
        osDevices: osDevices, osDetails: osDetailsList, mezDetails: mezDetails, etiquetas: etiquetas,
        scratchpad: scratchpad,
        meetingNotes: meetingNotes,
        progressPct: tp,
        updatedAt: new Date().toISOString(),
      }));
      if (onProjectSaved) onProjectSaved(pid);
    }, 1000);
    return function() { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [a, nt, pblLines, osDevices, osDetailsList, mezDetails, etiquetas, scratchpad, meetingNotes]);

  // Scroll-to-question + flash when navigating from A Definir panel
  useEffect(function() {
    if (!pendingScrollQId) return;
    var tid1 = null, tid2 = null, tid3 = null;
    tid1 = setTimeout(function() {
      var el = document.getElementById('qf-' + pendingScrollQId);
      if (!el) { setPendingScrollQId(null); return; }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      tid2 = setTimeout(function() {
        el.classList.remove('qf-flash'); // reset if already animating
        void el.offsetWidth;             // force reflow so animation restarts
        el.classList.add('qf-flash');
        tid3 = setTimeout(function() {
          el.classList.remove('qf-flash');
          setPendingScrollQId(null); // clear after animation so cleanup não cancela o flash
        }, 1100);
      }, 500);
    }, 150);
    // cleanup captura tid1/tid2/tid3 por referência (var no mesmo escopo)
    return function() { clearTimeout(tid1); clearTimeout(tid2); clearTimeout(tid3); };
  }, [pendingScrollQId]);

  var ch = useCallback(function(id,v){setA(function(p){var n=Object.assign({},p);n[id]=v;return n;});},[]);
  var nc = useCallback(function(id,v){setN(function(p){var n=Object.assign({},p);n[id]=v;return n;});},[]);
  var tgo = useCallback(function(id){setSo(function(p){var n=Object.assign({},p);n[id]=!p[id];return n;});},[]);

  var bJ = function(){var o={meta:{project:a.g1||a.g2||'WCS',date:new Date().toISOString(),v:'4.0',total_pct:tp,filled:ta},sections:{},progress:{},notes:{},pbl_lines:[],os_devices:[],os_details:[],mez_details:[],etiquetas_custom:[],meeting_notes:meetingNotes};SEC.forEach(function(s){var d={};gv(s,a).forEach(function(q){if(a[q.id]&&a[q.id]!=='')d[q.id]=a[q.id]});if(Object.keys(d).length)o.sections[s.id]=d;if(nt[s.id])o.notes[s.id]=nt[s.id];var pr=gpr(s);o.progress[s.id]={title:s.t,pct:pr.p,filled:pr.a,total:pr.t};});o.pbl_lines=pblLines.map(function(line){var d={};gvPbl(line).forEach(function(q){if(line[q.id]&&line[q.id]!=='')d[q.id]=line[q.id];});return d;}).filter(function(d){return Object.keys(d).length>0});o.os_devices=osDevices.filter(function(d){return d.type||d.qty});o.os_details=osDetailsList.filter(function(v){return v});o.mez_details=mezDetails.filter(function(v){return v});o.etiquetas_custom=etiquetas.filter(function(e){return e.name});return o;};
  var bM = function(pend){var md='# NEXUS Kickoff — '+(a.g1||a.g2||'WCS')+'\n\n';if(!pend)md+='> **Prontidão total: '+tp+'%** · '+ta+' respostas preenchidas\n\n';SEC.forEach(function(s){if(s.id==='pb')return;var vis=gv(s,a);var items=pend==='tbd'?vis.filter(function(q){return isADefinir(a[q.id],q.t);}):pend?vis.filter(function(q){return !a[q.id]||a[q.id]==='';}):vis.filter(function(q){return a[q.id]&&a[q.id]!=='';});if(!items.length)return;var pr=gpr(s);var pctStr=pr.p===100?'100% ✓':pr.p+'% ('+pr.a+'/'+pr.t+')';md+='## '+s.t+' — '+pctStr+'\n';items.forEach(function(q){if(pend){md+='- [ ] '+q.q+'\n';}else{var v=a[q.id];if(q.t==='select'||q.t==='wms')v=to(v);if(q.t==='multi')v=v.split('|||').map(to).join(', ');md+='- **'+q.q+':** '+v+'\n';}});if(!pend&&nt[s.id])md+='\n> '+nt[s.id]+'\n';md+='\n';});if(!pend&&a.p1==='yes'&&pblLines.length>0){var pbSec=SEC.find(function(s){return s.id==='pb';});var pbPr=pbSec?gpr(pbSec):{p:0,a:0,t:0};var pbPctStr=pbPr.p===100?'100% ✓':pbPr.p+'% ('+pbPr.a+'/'+pbPr.t+')';md+='## PBL / FlowRack — '+pbPctStr+'\n';pblLines.forEach(function(line,i){md+='### Linha '+(i+1)+'\n';gvPbl(line).forEach(function(q){if(line[q.id]&&line[q.id]!==''){var v=line[q.id];if(q.t==='select')v=to(v);md+='- **'+q.q+':** '+v+'\n';}});md+='\n';});}return md;};
  var bJSec = function(secId){var s=SEC.find(function(x){return x.id===secId;});if(!s)return{};var d={};gv(s,a).forEach(function(q){if(a[q.id]&&a[q.id]!=='')d[q.id]=a[q.id];});return{section:secId,title:s.t,data:d,notes:nt[secId]||''};};
  var bMSec = function(secId){var s=SEC.find(function(x){return x.id===secId;});if(!s)return'';var vis=gv(s,a);var md='## '+s.t+'\n';vis.filter(function(q){return a[q.id]&&a[q.id]!=='';}).forEach(function(q){var v=a[q.id];if(q.t==='select'||q.t==='wms')v=to(v);if(q.t==='multi')v=v.split('|||').map(to).join(', ');md+='- **'+q.q+':** '+v+'\n';});if(nt[secId])md+='\n> '+nt[secId]+'\n';return md;};
  var hi = function(file){var rd=new FileReader();rd.onload=function(ev){try{var j=JSON.parse(ev.target.result);var flat={};if(j.sections){var vs=Object.values(j.sections);for(var i=0;i<vs.length;i++){var sec=vs[i];for(var k in sec)flat[k]=sec[k];}}if(Object.keys(flat).length)setA(flat);if(j.notes)setN(j.notes);if(Array.isArray(j.pbl_lines)&&j.pbl_lines.length)setPblLines(j.pbl_lines);if(Array.isArray(j.os_devices))setOsDevices(j.os_devices);if(Array.isArray(j.os_details))setOsDetailsList(j.os_details);if(Array.isArray(j.mez_details))setMezDetails(j.mez_details);if(Array.isArray(j.etiquetas_custom))setEtiquetas(j.etiquetas_custom);}catch(err){}};rd.readAsText(file);};

  var exA = function(){
    // Save to localStorage
    var now = new Date().toISOString();
    var currentPid = pid;
    if (!currentPid) {
      currentPid = generateId();
      setPid(currentPid);
    }
    var existing = loadProject(currentPid);
    upsertProject(Object.assign({}, existing || {
      id: currentPid, code: generateCode(),
      client: a.g1 || 'Sem cliente', name: a.g_codinome || a.g2 || a.g1 || 'Kickoff',
      createdAt: now,
    }, {
      answers: a, notes: nt, pblLines: pblLines,
      osDevices: osDevices, osDetails: osDetailsList, mezDetails: mezDetails, etiquetas: etiquetas,
      scratchpad: scratchpad,
      meetingNotes: meetingNotes,
      progressPct: tp,
      updatedAt: now,
    }));
    if (onProjectSaved) onProjectSaved(currentPid);
    setExM({t:'Baixar Kickoff',j:bJ(),m:bM(false),slug:'Nexus_Kickoff_'+(a.g1||'SemCliente').replace(/[\s\\/:\*?"<>|]+/g,'_')+'_'+(a.g2||'SemCodigo').replace(/[\s\\/:\*?"<>|]+/g,'_')});
  };
  var bJPend = function(mode){var r={meta:{project:a.g1||a.g2||'WCS',date:new Date().toISOString(),v:'4.0'},pendencias:[]};SEC.forEach(function(s){var vis=gv(s,a);vis.filter(function(q){return mode==='tbd'?isADefinir(a[q.id],q.t):(!a[q.id]||a[q.id]==='');}).forEach(function(q){r.pendencias.push({secao:s.t,secao_id:s.id,questao_id:q.id,questao:q.q,obrigatoria:!!q.e});});});return r;};
  var exP = function(){setExM({t:'Pendências',j:bJPend(),m:bM(true),jTbd:bJPend('tbd'),mTbd:bM('tbd'),slug:'Nexus_Kickoff_'+(a.g1||'SemCliente').replace(/[\s\\/:\*?"<>|]+/g,'_')+'_'+(a.g2||'SemCodigo').replace(/[\s\\/:\*?"<>|]+/g,'_')});};
  var exSec = function(secId){var s=SEC.find(function(x){return x.id===secId;});setExM({t:'Seção: '+(s?s.t:secId),j:bJSec(secId),m:bMSec(secId),slug:'Nexus_Kickoff_'+(a.g1||'SemCliente').replace(/[\s\\/:\*?"<>|]+/g,'_')+'_'+(a.g2||'SemCodigo').replace(/[\s\\/:\*?"<>|]+/g,'_')});};
  var doReset = function(secId){var s=SEC.find(function(x){return x.id===secId;});setConfirmModal({msg:'Resetar a seção "'+s.t+'"?',onConfirm:function(){setA(function(p){var n=Object.assign({},p);s.q.forEach(function(q){delete n[q.id];});return n;});setN(function(p){var n=Object.assign({},p);delete n[secId];return n;});if(secId==='pb')setPblLines([{}]);if(secId==='os'){setOsDevices([]);setOsDetailsList([]);}if(secId==='la')setMezDetails([]);if(secId==='et')setEtiquetas([]);setConfirmModal(null);}});};
  var limparTudo = function(){setConfirmModal({msg:'Limpar tudo? Todos os dados serão perdidos.',onConfirm:function(){setA({});setN({});setPblLines([{}]);setOsDevices([]);setOsDetailsList([]);setMezDetails([]);setEtiquetas([]);setScratchpad('');setMeetingNotes('');setConfirmModal(null);}});};
  var goSec = function(id){
    setCurSec(id);
    setSearch('');
    var ph = PHASES.find(function(p){return p.ids.indexOf(id)>=0;});
    if(ph) setCollPhases(function(){
      var n={};
      PHASES.forEach(function(p){n[p.id]=p.id!==ph.id;});
      return n;
    });
  };

  // Extra required fields from PBL lines (stored in pblLines, not in 'a')
  var pblExtra=(function(){
    if(a.p1!=='yes')return{a:0,t:0};
    var tot=0,fil=0;
    pblLines.forEach(function(line){
      var vis=gvPbl(line).filter(function(q){return q.e;});
      tot+=vis.length;
      fil+=vis.filter(function(q){return line[q.id]&&line[q.id]!==''&&!isADefinir(line[q.id],q.t);}).length;
    });
    return{a:fil,t:tot};
  })();
  var gpr=function(s){
    var p=gp(s,a);
    if(s.id!=='pb')return p;
    var ta=p.a+pblExtra.a,tt=p.t+pblExtra.t;
    return{a:ta,t:tt,p:tt?Math.round(ta/tt*100):0};
  };

  var tp = (function(){var n=0,t=0;SEC.forEach(function(s){var p=gpr(s);n+=p.a;t+=p.t;});return t?Math.round(n/t*100):0;})();
  var ta = SEC.reduce(function(n,s){return n+gv(s,a).filter(function(q){return a[q.id]&&a[q.id]!=='';}).length;},0);
  var aDefinir = getADefinir(a, pblLines);
  var secIdx = curSec ? SEC.findIndex(function(s){return s.id===curSec;}) : -1;
  var prevSecId = secIdx > 0 ? SEC[secIdx-1].id : null;
  var nextSecId = secIdx >= 0 && secIdx < SEC.length-1 ? SEC[secIdx+1].id : null;

  var searchResults = (function(){
    if(!search||search.length<1)return null;
    var q=search.toLowerCase(),res=[];
    SEC.forEach(function(s){
      if(s.t.toLowerCase().indexOf(q)>=0){res.push({s:s,match:'section'});return;}
      var mq=s.q.filter(function(qq){return qq.q.toLowerCase().indexOf(q)>=0;});
      if(mq.length>0)res.push({s:s,match:'question',count:mq.length,first:mq[0].q});
    });
    return res;
  })();

  // ── Left nav
  function renderLeftNav() {
    return (
      <Box sx={{ width:240, minWidth:240, borderRight:'1px solid', borderColor:'divider', overflowY:'auto', bgcolor:'#111111', display:'flex', flexDirection:'column', flexShrink:0 }}>
        {/* Search */}
        <Box sx={{ p:'14px 12px 8px' }}>
          <TextField
            fullWidth size="small"
            value={search}
            onChange={function(e){setSearch(e.target.value);}}
            placeholder="Busque uma pergunta."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize:15, color: search ? 'primary.main' : 'text.disabled' }} />
                  </InputAdornment>
                ),
                style: { fontSize:12 },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor:'rgba(255,197,0,0.45)', borderWidth:1.5 },
                '&:hover fieldset': { borderColor:'rgba(255,197,0,0.7)', borderWidth:1.5 },
                '&.Mui-focused fieldset': { borderColor:'primary.main', borderWidth:2 },
              },
              '& input::placeholder': { fontSize:12 },
            }}
          />
        </Box>

        {/* Search results */}
        {searchResults && (
          <Box sx={{ flex:1, overflowY:'auto', p:'0 8px 8px' }}>
            {searchResults.length === 0
              ? <Typography sx={{ fontSize:11, color:'text.disabled', p:'8px 4px' }}>Sem resultados</Typography>
              : searchResults.map(function(r){return (
                  <Paper key={r.s.id} elevation={0} onClick={function(){goSec(r.s.id);}} sx={{ p:'9px 10px', mb:'4px', cursor:'pointer', bgcolor: curSec===r.s.id ? 'rgba(255,197,0,0.10)' : '#2e2e2e', borderColor: curSec===r.s.id ? 'rgba(255,197,0,0.3)' : 'divider' }}>
                    <Typography sx={{ fontSize:12, fontWeight:600, color: curSec===r.s.id ? 'primary.main' : 'text.primary' }}>{r.s.n}. {r.s.t}</Typography>
                    {r.match==='question' && <Typography sx={{ fontSize:10, color:'text.disabled' }}>{r.count} pergunta(s) — ex: {r.first}</Typography>}
                  </Paper>
                );})
            }
          </Box>
        )}

        {/* Phase groups */}
        {!searchResults && aDefCollapsed && (
          <Box sx={{ flex:1, overflowY:'auto', py:'4px' }}>
            {PHASES.map(function(ph){
              var collapsed = !!collPhases[ph.id];
              var phSecs = SEC.filter(function(s){return ph.ids.indexOf(s.id)>=0;});
              var ptot=0, pans=0;
              phSecs.forEach(function(s){var p=gpr(s);ptot+=p.t;pans+=p.a;});
              var ppct = ptot ? Math.round(pans/ptot*100) : 0;
              return (
                <Box key={ph.id}>
                  <Box
                    component="button"
                    onClick={function(){setCollPhases(function(p){var n=Object.assign({},p);n[ph.id]=!p[ph.id];return n;});}}
                    sx={{ width:'100%', display:'flex', alignItems:'center', gap:'7px', p:'10px 12px 6px', bgcolor:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}
                  >
                    <Typography sx={{ fontSize:8, color:'primary.main', transition:'.18s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', display:'inline-block' }}>▾</Typography>
                    <Typography sx={{ flex:1, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.2px', color: ppct===100 ? '#22c55e' : collapsed ? 'text.disabled' : 'text.primary' }}>{ph.label}</Typography>
                    {ppct === 100
                      ? <Box sx={{ width:8, height:8, borderRadius:'50%', bgcolor:'#22c55e', flexShrink:0 }} />
                      : <Box sx={{ width:8, height:8, borderRadius:'50%', border:'1.5px solid', borderColor: ppct > 0 ? Y : 'rgba(255,255,255,0.2)', bgcolor:'transparent', flexShrink:0 }} />
                    }
                  </Box>
                  {!collapsed && phSecs.map(function(s){
                    var pr = gpr(s);
                    var gQ = s.q.find(function(q){return q.g;});
                    var isNA = s.id==='pk' ? (a['cf_gate']==='no' && a['pk1']==='no') : (gQ && a[gQ.id]==='no');
                    var isActive = curSec===s.id;
                    var isDone = pr.p===100 && pr.t>0;
                    var deptColor = getSecColor(s.id);
                    return (
                      <Box
                        key={s.id}
                        component="button"
                        onClick={function(){goSec(s.id);}}
                        sx={{ width:'100%', display:'flex', alignItems:'center', gap:'9px', p:'7px 12px', bgcolor: isActive ? 'rgba(255,197,0,0.08)' : 'transparent', border:'none', borderLeft:'2px solid', borderLeftColor: isActive ? 'primary.main' : (isDone && !isNA) ? '#22c55e' : 'transparent', cursor:'pointer', textAlign:'left' }}
                      >
                        <Box sx={{ minWidth:21, height:21, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontSize:9, fontWeight:700, bgcolor: isActive ? 'primary.main' : (isDone && !isNA) ? 'rgba(34,197,94,0.2)' : isNA ? '#383838' : 'rgba(255,255,255,0.75)', color: isActive ? '#0b0e14' : (isDone && !isNA) ? '#22c55e' : isNA ? 'text.disabled' : '#0b0e14', flexShrink:0 }}>
                          {s.n}
                        </Box>
                        <Box sx={{ flex:1, minWidth:0 }}>
                          <Typography sx={{ fontSize:12, fontWeight: isActive ? 700 : 500, color: isActive ? 'primary.main' : isNA ? 'text.disabled' : isDone ? '#22c55e' : 'text.primary', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.t}</Typography>
                          {isActive && (
                            <Box sx={{ height:3, borderRadius:'2px', bgcolor:'#383838', overflow:'hidden', mt:'3px' }}>
                              <Box sx={{ height:3, borderRadius:'2px', width:pr.p+'%', bgcolor: isDone ? '#22c55e' : pr.p>0 ? deptColor : 'transparent', transition:'width .3s' }} />
                            </Box>
                          )}
                        </Box>
                        {isDone
                          ? <Typography sx={{ fontSize:13, color:'#22c55e', flexShrink:0, lineHeight:1 }}>✓</Typography>
                          : <Typography sx={{ fontSize:9, fontFamily:'monospace', color:'text.disabled', flexShrink:0 }}>{pr.a}/{pr.t}</Typography>
                        }
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        )}

        {/* A Definir accordion — moved here from right panel */}
        {!searchResults && (
          <Box sx={{ ...(!aDefCollapsed ? { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' } : {}), border:'1px solid rgba(245,158,11,0.25)', bgcolor:'rgba(245,158,11,0.04)', pt:'8px', px:'10px', pb:'8px' }}>
            <Box
              component="button"
              onClick={function(){setADefCollapsed(function(v){return !v;});}}
              sx={{ width:'100%', display:'flex', alignItems:'center', gap:0.75, bgcolor:'transparent', border:'none', cursor:'pointer', p:0, mb: aDefCollapsed ? 0 : 1, flexShrink:0 }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize:13, color:'#f59e0b' }} />
              <Typography sx={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.2px', color:'#f59e0b', flex:1, textAlign:'left' }}>A Definir</Typography>
              <Chip label={aDefinir.length} size="small" sx={{ fontSize:9, height:16, bgcolor: aDefinir.length > 0 ? 'rgba(245,158,11,0.15)' : '#383838', color: aDefinir.length > 0 ? '#f59e0b' : 'text.disabled', border:'none' }} />
              <KeyboardArrowDownRoundedIcon sx={{ fontSize:14, color:'#f59e0b', transform: aDefCollapsed ? 'none' : 'rotate(180deg)', transition:'transform .2s' }} />
            </Box>
            {!aDefCollapsed && (
              <Box sx={{ flex:1, overflowY:'auto' }}>
                {aDefinir.length === 0
                  ? <Typography sx={{ fontSize:11, color:'text.disabled', fontStyle:'italic' }}>Nenhum item a definir.</Typography>
                  : <Stack spacing={0}>
                      {aDefinir.map(function(item,i){return (
                        <Box
                          key={item.qId}
                          component="button"
                          onClick={function(){
                            var sec = SEC.find(function(s){ return s.id === item.secId; });
                            if (sec) {
                              var isOpt = sec.q.some(function(q){ return q.id === item.qId && !q.e; });
                              if (isOpt) setSo(function(p){ var n=Object.assign({},p); n[item.secId]=true; return n; });
                            }
                            goSec(item.secId);
                            setPendingScrollQId(item.qId);
                          }}
                          sx={{
                            display:'flex', alignItems:'flex-start', gap:1, py:'6px', width:'100%',
                            bgcolor:'transparent', border:'none', cursor:'pointer', textAlign:'left',
                            borderBottom: i<aDefinir.length-1 ? '1px solid' : 'none', borderColor:'divider',
                            '&:hover .adef-label':{ color:'primary.main' },
                          }}
                        >
                          <Box sx={{ width:5, height:5, borderRadius:'50%', bgcolor:'#f59e0b', flexShrink:0, mt:'4px' }} />
                          <Box sx={{ flex:1, minWidth:0 }}>
                            <Typography className="adef-label" sx={{ fontSize:11, fontWeight:600, color:'text.primary', transition:'color .15s', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.qLabel}</Typography>
                            <Typography sx={{ fontSize:9, color:'text.secondary', mt:'1px' }}>{item.secLabel}</Typography>
                          </Box>
                        </Box>
                      );})}
                    </Stack>
                }
              </Box>
            )}
          </Box>
        )}

      </Box>
    );
  }

  // ── Right panel
  function renderRightPanel() {
    var pctColor = tp<30 ? '#dc2626' : tp<70 ? Y : '#22c55e';
    if (rightCollapsed) {
      return (
        <Box sx={{ width:32, minWidth:32, borderLeft:'1px solid', borderColor:'divider', bgcolor:'#111111', display:'flex', flexDirection:'column', alignItems:'center', pt:1.5, gap:0.5, flexShrink:0 }}>
          <IconButton size="small" onClick={function(){setRightCollapsed(false);}} sx={{ color:'text.disabled', '&:hover':{ color:'primary.main' } }}>
            <ChevronLeftRoundedIcon sx={{ fontSize:18 }} />
          </IconButton>
          {onToggleFullscreen && (
            <Tooltip title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'} placement="left">
              <IconButton size="small" onClick={onToggleFullscreen} sx={{ color:'text.disabled', '&:hover':{ color:'primary.main' } }}>
                {isFullscreen ? <FullscreenExitRoundedIcon sx={{ fontSize:16 }} /> : <FullscreenRoundedIcon sx={{ fontSize:16 }} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    }
    return (
      <Box sx={{ width:270, minWidth:270, borderLeft:'1px solid', borderColor:'divider', bgcolor:'#111111', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
        {/* Header: go to project + fullscreen + collapse */}
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, pt:2, pb:1, flexShrink:0 }}>
          {onNavigate && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<FolderOpenRoundedIcon sx={{ fontSize:'14px !important' }} />}
              onClick={function(){ onNavigate('overview'); }}
              sx={{ fontSize:11, py:'3px', color:'text.secondary', borderColor:'divider', '&:hover':{ borderColor:'primary.main', color:'primary.main' } }}
            >
              Ir para Projeto
            </Button>
          )}
          <Box sx={{ display:'flex', gap:0.25, ml:'auto' }}>
            {onToggleFullscreen && (
              <Tooltip title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
                <IconButton size="small" onClick={onToggleFullscreen} sx={{ color:'text.disabled', '&:hover':{ color:'primary.main' } }}>
                  {isFullscreen ? <FullscreenExitRoundedIcon sx={{ fontSize:18 }} /> : <FullscreenRoundedIcon sx={{ fontSize:18 }} />}
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={function(){setRightCollapsed(true);}} sx={{ color:'text.disabled', '&:hover':{ color:'primary.main' } }}>
              <ChevronRightRoundedIcon sx={{ fontSize:18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Readiness */}
        <Box sx={{ px:2, pb:2, flexShrink:0 }}>
          <Stack direction="row" alignItems="center" sx={{ mb:1.25, gap:2 }}>
            <Typography sx={{ fontSize:11, fontWeight:700, color:pctColor }}>{tp}%</Typography>
            <Typography sx={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.2px', color:'text.disabled' }}>Progresso Kickoff</Typography>
          </Stack>
          <Box sx={{ height:7, borderRadius:'4px', bgcolor:'#383838', overflow:'hidden' }}>
            <Box sx={{ height:7, borderRadius:'4px', width:tp+'%', bgcolor:pctColor, transition:'width .4s' }} />
          </Box>
        </Box>

        {/* Meeting Notes accordion — cresce quando aberto, encolhe quando fechado */}
        <Box sx={{ flexGrow:meetingNotesOpen ? 1 : 0, flexShrink:1, px:2, display:'flex', flexDirection:'column', minHeight:0, mb:2 }}>
          <Box sx={{ border:'1px solid rgba(255,197,0,0.3)', borderRadius:'8px', overflow:'hidden', bgcolor:'rgba(255,197,0,0.03)', display:'flex', flexDirection:'column', flexGrow:meetingNotesOpen ? 1 : 0 }}>
            <Box
              component="button"
              onClick={function(){setMeetingNotesOpen(function(v){ var next=!v; try{localStorage.setItem('nexus_kickoff_mno',next?'1':'0');}catch{} return next; });}}
              sx={{ width:'100%', display:'flex', alignItems:'center', gap:0.75, bgcolor:'transparent', border:'none', cursor:'pointer', p:'10px 12px', textAlign:'left', flexShrink:0 }}
            >
              <EditNoteRoundedIcon sx={{ fontSize:16, color:Y, flexShrink:0 }} />
              <Typography sx={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.2px', color:Y, flex:1 }}>
                Notas da Reunião
              </Typography>
              {meetingNotes && !meetingNotesOpen && (
                <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:Y, flexShrink:0, mr:0.5 }} />
              )}
              <KeyboardArrowDownRoundedIcon sx={{ fontSize:14, color:Y, transform:meetingNotesOpen?'rotate(180deg)':'none', transition:'transform .2s', flexShrink:0 }} />
            </Box>
            {meetingNotesOpen && (
              <Box sx={{ flex:1, px:'10px', pb:'10px', pt:'2px', display:'flex', flexDirection:'column', minHeight:0 }}>
                <Box
                  component="textarea"
                  value={meetingNotes}
                  onChange={function(e){setMeetingNotes(e.target.value);}}
                  placeholder={'Anote aqui os pontos discutidos na reunião para preencher o formulário depois...'}
                  sx={{
                    flex:1, minHeight:0, width:'100%', boxSizing:'border-box',
                    resize:'none', overflowY:'auto',
                    background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,197,0,0.15)',
                    borderRadius:'6px', color:'rgba(255,255,255,0.85)', fontSize:12, fontFamily:'inherit',
                    p:'8px', outline:'none', lineHeight:1.6,
                    '&::placeholder':{ color:'rgba(255,255,255,0.2)' },
                    '&:focus':{ borderColor:'rgba(255,197,0,0.4)' },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Review + Export actions */}
        <Box sx={{ px:2, pb:2, flexShrink:0 }}>
          <Button
            fullWidth size="small"
            variant={curSec==='__rev__' ? 'contained' : 'outlined'}
            color="primary"
            onClick={function(){setCurSec('__rev__');}}
            sx={{ fontSize:12, mb:1.5 }}
          >
            Revisar respostas ({ta})
          </Button>
          <Typography sx={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.2px', color:'text.disabled', mb:1 }}>Exportar</Typography>
          <Stack spacing={0.75}>
            <Button fullWidth variant="contained" color="primary" size="small" startIcon={<DownloadRoundedIcon />} onClick={exA} sx={{ fontWeight:700 }}>Baixar Kickoff</Button>
            <Box sx={{ display:'flex', gap:0.75 }}>
              <Button fullWidth variant="outlined" size="small" onClick={exP} sx={{ fontSize:12, borderColor:'rgba(251,191,36,0.3)', color:'#fbbf24', bgcolor:'rgba(120,53,15,0.5)', '&:hover':{ bgcolor:'rgba(120,53,15,0.7)', borderColor:'rgba(251,191,36,0.5)' } }}>Pendências</Button>
              <Button fullWidth variant="outlined" color="inherit" size="small" onClick={function(){fr.current&&fr.current.click();}} sx={{ fontSize:12, color:'text.secondary', borderColor:'divider' }}>Carregar JSON</Button>
            </Box>
            <input ref={fr} type="file" accept=".json" style={{display:'none'}} onChange={function(e){if(e.target.files&&e.target.files[0])hi(e.target.files[0]);e.target.value='';}} />
          </Stack>
        </Box>
      </Box>
    );
  }

  // ── Home
  function renderHome() {
    return (
      <Box sx={{ p:'28px 28px 40px' }}>
        <Box sx={{ mb:3 }}>
          <Typography sx={{ fontSize:11, color:'text.disabled', fontFamily:'monospace', mb:'4px' }}>NEXUS · KICKOFF WCS</Typography>
          <Typography sx={{ fontSize:24, fontWeight:800, color:'text.primary', letterSpacing:'-.5px' }}>Bem-vindo</Typography>
          <Typography sx={{ fontSize:13, color:'text.secondary', mt:'4px' }}>Selecione uma seção na barra lateral para começar.</Typography>
        </Box>
        <Box sx={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:1.5 }}>
          {PHASES.map(function(ph){
            var phSecs=SEC.filter(function(s){return ph.ids.indexOf(s.id)>=0;});
            var ptot=0, pans=0;
            phSecs.forEach(function(s){var p=gpr(s);ptot+=p.t;pans+=p.a;});
            var ppct = ptot ? Math.round(pans/ptot*100) : 0;
            var pc = ppct===100 ? '#22c55e' : ppct>0 ? Y : 'text.disabled';
            return (
              <Paper key={ph.id} elevation={0} onClick={function(){goSec(phSecs[0].id);}} sx={{ p:2, cursor:'pointer', transition:'.15s', '&:hover':{ borderColor:'rgba(255,197,0,0.3)' } }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1.25 }}>
                  <Typography sx={{ fontSize:12, fontWeight:600, color:'text.primary' }}>{ph.label}</Typography>
                  <Typography sx={{ fontSize:12, fontFamily:'monospace', fontWeight:700, color:pc }}>{ppct}%</Typography>
                </Box>
                <Box sx={{ height:5, borderRadius:'3px', bgcolor:'#383838', overflow:'hidden' }}>
                  <Box sx={{ height:5, borderRadius:'3px', width:ppct+'%', bgcolor:pc, transition:'width .4s' }} />
                </Box>
                <Typography sx={{ fontSize:10, color:'text.disabled', mt:'6px' }}>{pans} de {ptot} preenchidos</Typography>
              </Paper>
            );
          })}
        </Box>
        <Box sx={{ mt:2.5, textAlign:'center' }}>
          <Button variant="contained" color="primary" size="medium" onClick={function(){goSec('ge');}} sx={{ fontWeight:700, fontSize:13 }}>
            Começar pela Seção 1
          </Button>
        </Box>
      </Box>
    );
  }

  // ── Section form
  function renderSectionForm(s) {
    var pr = gpr(s);
    var vis = gv(s,a);
    var eq = vis.filter(function(q){return q.e;});
    var oq = vis.filter(function(q){return !q.e && (s.id!=='in' || q.id!=='in1b');});
    var pctColor = pr.p===100 ? '#22c55e' : pr.p>0 ? Y : 'text.disabled';
    var statusLabel = pr.p===100 ? 'Completo' : pr.p>0 ? 'Em andamento' : 'Não iniciado';
    var deptColor = getSecColor(s.id);
    return (
      <Box sx={{ p:'24px 28px 40px' }}>
        {/* Project identity strip */}
        {/* Header */}
        <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', mb:1.5 }}>
          <Box>
            <Typography sx={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:deptColor, mb:'5px' }}>Seção {s.n}</Typography>
            <Typography sx={{ fontSize:22, fontWeight:800, color:'text.primary', letterSpacing:'-.5px' }}>{s.t}</Typography>
            <Typography sx={{ fontSize:10, color:'text.disabled', mt:'3px' }}>auto-salvo ativo</Typography>
          </Box>
          <Box sx={{ textAlign:'right', flexShrink:0 }}>
            <Typography sx={{ fontFamily:'monospace', fontSize:24, fontWeight:700, color:pctColor, lineHeight:1 }}>{pr.p}%</Typography>
            <Chip
              size="small" label={statusLabel}
              sx={{ mt:'6px', fontSize:10, fontWeight:700,
                bgcolor: pr.p===100 ? 'rgba(34,197,94,0.12)' : pr.p>0 ? 'rgba(255,197,0,0.10)' : 'rgba(74,90,120,0.10)',
                color: pr.p===100 ? '#22c55e' : pr.p>0 ? Y : 'text.disabled',
                borderColor: pr.p===100 ? 'rgba(34,197,94,0.3)' : pr.p>0 ? 'rgba(255,197,0,0.3)' : 'rgba(74,90,120,0.2)',
              }}
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Dept color bar */}
        <Box sx={{ height:3, borderRadius:'2px', bgcolor:deptColor, mb:2.5, opacity:.5 }} />

        {/* Infra cost warning */}
        {s.id==='if' && a.if_titul==='srv_invent' && a.if_ambientes==='yes' && (
          <Paper elevation={0} sx={{ display:'flex', gap:1.25, p:'10px 13px', borderRadius:1.5, bgcolor:'rgba(245,158,11,0.08)', borderColor:'rgba(245,158,11,0.25)', mb:1.75 }}>
            <WarningAmberRoundedIcon sx={{ fontSize:18, color:'#f59e0b', flexShrink:0, mt:'1px' }} />
            <Box>
              <Typography sx={{ fontSize:12.5, fontWeight:700, color:'#f59e0b' }}>Alerta de custo</Typography>
              <Typography sx={{ fontSize:11.5, color:'text.secondary' }}>2 ambientes Invent — verificar escopo contratado</Typography>
            </Box>
          </Paper>
        )}

        {/* Required fields */}
        {s.id==='pb'
          ? <PBLCard a={a} ch={ch} pblLines={pblLines} setPblLines={setPblLines} />
          : eq.map(function(q){
              var in1bQ = s.id==='in' && q.id==='in1' ? s.q.find(function(x){return x.id==='in1b';}) : null;
              return (
                <Box key={q.id}>
                  <QF q={q} v={a[q.id]} ch={ch} a={a}/>
                  {in1bQ && (
                    showIn1b ? (
                      <Box sx={{ display:'flex', alignItems:'flex-start', gap:0.5 }}>
                        <Box sx={{ flex:1 }}>
                          <QF q={in1bQ} v={a['in1b']} ch={ch} a={a} qid="in1b"/>
                        </Box>
                        <Tooltip title="Remover segundo tipo">
                          <IconButton size="small" onClick={function(){setShowIn1b(false);setA(function(p){var n=Object.assign({},p);delete n['in1b'];return n;});}} sx={{ color:'text.disabled','&:hover':{color:'error.main'},mt:'30px',flexShrink:0 }}>
                            <CloseRoundedIcon sx={{ fontSize:13 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Tooltip title="Adicionar segundo tipo de integração">
                        <IconButton size="small" onClick={function(){setShowIn1b(true);}} sx={{ color:'text.disabled','&:hover':{color:'primary.main'},mt:'-2px' }}>
                          <AddRoundedIcon sx={{ fontSize:16 }} />
                        </IconButton>
                      </Tooltip>
                    )
                  )}
                </Box>
              );
            })
        }

        {/* Special components */}
        {s.id==='la' && a.l3==='yes' && a.l5 && parseInt(a.l5)>0 && <MezDetails n={parseInt(a.l5)} details={mezDetails} setDetails={setMezDetails} />}
        {s.id==='os' && <OSDevices devices={osDevices} setDevices={setOsDevices} />}
        {s.id==='os' && a.os1 && parseInt(a.os1)>0 && <OsDetails n={parseInt(a.os1)} details={osDetailsList} setDetails={setOsDetailsList} />}
        {s.id==='et' && <EtiquetasEditor etiquetas={etiquetas} setEtiquetas={setEtiquetas} />}

        {/* Optional fields */}
        {oq.length > 0 && s.id!=='pb' && (
          <Box sx={{ mt:2.5 }}>
            <Typography sx={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.2px', color:'primary.main', mb:1 }}>Perguntas opcionais</Typography>
            {oq.map(function(q){return <QF key={q.id} q={q} v={a[q.id]} ch={ch} a={a}/>;  })}
          </Box>
        )}

        {/* Notes */}
        <Box sx={{ mt:2.5 }}>
          <Typography sx={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'1.2px', color:'primary.main', mb:1 }}>Observações</Typography>
          <TextField
            fullWidth multiline minRows={2} size="small"
            value={nt[s.id]||''}
            onChange={function(e){nc(s.id,e.target.value);}}
            placeholder="Observações da seção..."
            sx={{ '& textarea':{ fontStyle:'italic', color:'text.secondary' } }}
          />
        </Box>

        {/* Footer nav */}
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mt:2.25, pt:1.75, borderTop:'1px solid', borderColor:'divider' }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            disabled={!prevSecId}
            startIcon={<ArrowBackRoundedIcon sx={{ fontSize:'15px !important' }} />}
            onClick={function(){if(prevSecId)goSec(prevSecId);}}
            sx={{ fontSize:13, fontWeight:600, color:'text.secondary', borderColor:'divider', px:2, minWidth:110 }}
          >
            Anterior
          </Button>
          <Typography sx={{ fontSize:10, color:'text.disabled', fontFamily:'monospace' }}>
            {secIdx+1} / {SEC.length}
          </Typography>
          <Button
            variant={nextSecId ? 'contained' : 'outlined'}
            color="primary"
            size="small"
            disabled={!nextSecId}
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize:'15px !important' }} />}
            onClick={function(){if(nextSecId)goSec(nextSecId);}}
            sx={{ fontSize:13, fontWeight:700, px:2, minWidth:110 }}
          >
            Próxima
          </Button>
        </Box>
      </Box>
    );
  }

  // ── Revisar
  function renderRevisar() {
    return (
      <Box sx={{ p:'24px 28px 40px' }}>
        <Box sx={{ mb:2.5 }}>
          <Typography sx={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:'primary.main', mb:'5px' }}>Revisão</Typography>
          <Typography sx={{ fontSize:22, fontWeight:800, color:'text.primary' }}>Respostas preenchidas</Typography>
          <Typography sx={{ fontSize:12, color:'text.secondary', mt:'4px' }}>{ta} respostas · {tp}% concluído</Typography>
        </Box>
        <Box sx={{ display:'flex', gap:1, mb:2.5 }}>
          <Button variant="contained" color="primary" size="small" startIcon={<DownloadRoundedIcon />} onClick={exA} sx={{ fontWeight:700 }}>Baixar Kickoff</Button>
          <Button variant="outlined" size="small" onClick={exP} sx={{ fontSize:12, color:'#fbbf24', borderColor:'rgba(251,191,36,0.3)', bgcolor:'rgba(120,53,15,0.5)' }}>Pendencias</Button>
        </Box>
        <Stack spacing={1.5}>
          {SEC.map(function(s){
            if(s.id==='pb')return null;
            var ans=gv(s,a).filter(function(q){return a[q.id]&&a[q.id]!=='';});
            if(!ans.length&&!nt[s.id])return null;
            var gQ=s.q.find(function(q){return q.g;});
            if(gQ&&a[gQ.id]==='no')return null;
            return (
              <Paper key={s.id} elevation={0}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:'12px 16px', borderBottom:'1px solid', borderColor:'divider' }}>
                  <Typography sx={{ fontWeight:600, fontSize:14, color:'text.primary' }}>{s.t}</Typography>
                  <Button size="small" variant="outlined" color="primary" onClick={function(){goSec(s.id);}} sx={{ fontSize:11, py:'3px' }}>Editar</Button>
                </Box>
                <Box sx={{ p:'8px 16px' }}>
                  {ans.map(function(q){
                    var v=a[q.id];
                    if(q.t==='select'||q.t==='wms')v=to(v);
                    if(q.t==='multi')v=v.split('|||').map(to).join(', ');
                    return (
                      <Box key={q.id} sx={{ display:'flex', justifyContent:'space-between', py:'5px', borderBottom:'1px solid rgba(58,58,58,0.22)' }}>
                        <Typography sx={{ fontSize:12.5, color:'text.secondary' }}>{q.q}</Typography>
                        <Typography sx={{ fontSize:12.5, color:'text.primary', fontWeight:500, textAlign:'right', maxWidth:'55%' }}>{v}</Typography>
                      </Box>
                    );
                  })}
                  {nt[s.id] && (
                    <Box sx={{ mt:1, p:'7px 11px', bgcolor:'#2e2e2e', borderRadius:1, borderLeft:'3px solid', borderLeftColor:'primary.main' }}>
                      <Typography sx={{ fontSize:11.5, color:'text.secondary', fontStyle:'italic' }}>{nt[s.id]}</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}

          {a.p1==='yes' && pblLines.some(function(l){return Object.keys(l).length>0;}) && (
            <Paper elevation={0}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:'12px 16px', borderBottom:'1px solid', borderColor:'divider' }}>
                <Typography sx={{ fontWeight:600, fontSize:14, color:'text.primary' }}>PBL / FlowRack</Typography>
                <Button size="small" variant="outlined" color="primary" onClick={function(){goSec('pb');}} sx={{ fontSize:11, py:'3px' }}>Editar</Button>
              </Box>
              <Box sx={{ p:'8px 16px' }}>
                {pblLines.map(function(line,i){
                  var filled=gvPbl(line).filter(function(q){return line[q.id]&&line[q.id]!=='';});
                  if(!filled.length)return null;
                  return (
                    <Box key={i} sx={{ mb:1 }}>
                      <Typography sx={{ fontSize:11, fontWeight:700, color:'primary.main', mb:'5px' }}>Linha {i+1}</Typography>
                      {filled.map(function(q){
                        var v=line[q.id];
                        if(q.t==='select')v=to(v);
                        return (
                          <Box key={q.id} sx={{ display:'flex', justifyContent:'space-between', py:'4px', borderBottom:'1px solid rgba(58,58,58,0.22)' }}>
                            <Typography sx={{ fontSize:12.5, color:'text.secondary' }}>{q.q}</Typography>
                            <Typography sx={{ fontSize:12.5, color:'text.primary', fontWeight:500 }}>{v}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          )}
        </Stack>
        <Button fullWidth variant="outlined" color="inherit" size="small" onClick={function(){setCurSec(null);}} sx={{ mt:1, color:'text.secondary', borderColor:'divider' }}>
          Voltar ao inicio
        </Button>
      </Box>
    );
  }

  var curS = curSec && curSec!=='__rev__' ? SEC.find(function(s){return s.id===curSec;}) : null;

  return (
    <Box
      sx={{ display:'flex', height:'100%', overflow:'hidden', color:'text.primary', fontFamily:"-apple-system,sans-serif" }}
      onDrop={function(e){e.preventDefault();var f=e.dataTransfer&&e.dataTransfer.files[0];if(f)hi(f);}}
      onDragOver={function(e){e.preventDefault();}}
    >
      {confirmModal && <ConfirmModal msg={confirmModal.msg} onConfirm={confirmModal.onConfirm} onCancel={function(){setConfirmModal(null);}} />}
      {exM && <ExportModal exM={exM} setExM={setExM} cpRef={cpRef} />}

      {renderLeftNav()}

      <Box sx={{ flex:1, overflowY:'auto', minWidth:0 }}>
        {!curSec && renderHome()}
        {curSec==='__rev__' && renderRevisar()}
        {curS && renderSectionForm(curS)}
      </Box>

      {renderRightPanel()}
    </Box>
  );
}
