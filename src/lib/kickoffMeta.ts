// IDs de perguntas obrigatórias do kickoff (4º argumento = 1 na função Q()).
// Opcionais (4º arg = 0) são excluídas da contagem de progresso.
export const REQUIRED_FIELDS = new Set([
  // Info Gerais
  'g1','g2','g3','g4','g5','g_golive',
  // Layout (sem gate)
  'c2','l1','l1_m','l3','l5',
  // Cubagem
  'cu1','c1',
  // Integração (sem gate)
  'in1',
  // Order Start
  'os_gate','os_r','os1','os4',
  // PBL (gate)
  'p1',
  // Picking Cart
  'ct1','ct_r','ct_qc','ct2','ct_d','ct_df','ct6','s1c','s2c',
  // Full Case
  'fc1','fc_r','fc2','fc2b','fc_i','fc_if','fc_re',
  // Conferência & Packing
  'cf_gate','cf_t1','cf2','cf_t2','pk1',
  // Sorter
  'st1','st2','st3','st4','st11','st11_tvs','st_rc',
  // Palletização & PTL
  'pt_gate','pt1','pt3',
  // Gestão de Estoque
  'es1','es2',
  // Etiquetas (sem gate)
  'et_r','et1',
  // Infraestrutura (sem gate)
  'if_titul','if_ambiente','if_s','if1','if2','if3','if4','if5','if6',
]);
