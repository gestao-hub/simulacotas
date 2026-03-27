-- Seed: Campanhas automáticas pré-configuradas
-- Usa subqueries para pegar IDs dos templates e cupons existentes

INSERT INTO public.campanhas (nome, status, tipo_trigger, canal, template_email_id, template_whatsapp, enviados_count) VALUES
(
  'Boas-vindas',
  'ativa',
  'boas_vindas',
  'email',
  (SELECT id FROM public.templates_email WHERE nome = 'Boas-vindas' LIMIT 1),
  NULL,
  0
),
(
  'Trial expirando (último dia)',
  'ativa',
  'trial_expirando',
  'ambos',
  (SELECT id FROM public.templates_email WHERE nome = 'Trial expirando' LIMIT 1),
  'Olá {{nome}}! 👋 Seu trial do SimulaCotas expira amanhã. Você já fez {{propostas_count}} propostas! Assine para não perder acesso: {{link_checkout}}',
  0
),
(
  'Trial expirou — reativação',
  'ativa',
  'trial_expirou',
  'ambos',
  (SELECT id FROM public.templates_email WHERE nome = 'Reativação com cupom' LIMIT 1),
  'Olá {{nome}}! Seu trial do SimulaCotas expirou. Use o cupom VOLTA10 para 10% de desconto: {{link_checkout}} 💚',
  0
),
(
  'Inadimplente — lembrete pagamento',
  'ativa',
  'inadimplente_3d',
  'whatsapp',
  NULL,
  'Olá {{nome}}! Notamos um problema com seu pagamento do SimulaCotas. Regularize aqui: {{link_checkout}} Estamos aqui para ajudar! 💚',
  0
),
(
  'Sensor de inatividade — check-in',
  'ativa',
  'inativo_7d',
  'whatsapp',
  NULL,
  'Olá {{nome}}! 👋 Notamos que você não usou o SimulaCotas nos últimos dias. Está tudo bem? Precisa de ajuda com alguma funcionalidade? Responda aqui que te ajudamos! 💚',
  0
);
