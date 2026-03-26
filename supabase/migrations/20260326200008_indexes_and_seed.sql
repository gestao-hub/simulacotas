-- ============================================================================
-- MIGRATION 008: Índices, Seed Data (administradoras + régua de cobrança)
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════════════════════════════════════════

-- Profiles
CREATE INDEX idx_profiles_empresa_id ON public.profiles(empresa_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_utm_source ON public.profiles(utm_source);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- User Roles
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Simulações
CREATE INDEX idx_simulacoes_user_id ON public.simulacoes(user_id);
CREATE INDEX idx_simulacoes_administradora_id ON public.simulacoes(administradora_id);
CREATE INDEX idx_simulacoes_created_at ON public.simulacoes(created_at DESC);
CREATE INDEX idx_simulacoes_user_created ON public.simulacoes(user_id, created_at DESC);

-- Propostas
CREATE INDEX idx_propostas_user_id ON public.propostas_geradas(user_id);
CREATE INDEX idx_propostas_simulacao_id ON public.propostas_geradas(simulacao_id);
CREATE INDEX idx_propostas_created_at ON public.propostas_geradas(created_at DESC);

-- Clientes
CREATE INDEX idx_clientes_user_id ON public.clientes_corretor(user_id);

-- Assinaturas
CREATE INDEX idx_assinaturas_user_id ON public.assinaturas(user_id);
CREATE INDEX idx_assinaturas_empresa_id ON public.assinaturas(empresa_id);
CREATE INDEX idx_assinaturas_status ON public.assinaturas(status);
CREATE INDEX idx_assinaturas_mp_preapproval ON public.assinaturas(mp_preapproval_id);

-- Pagamentos
CREATE INDEX idx_pagamentos_user_id ON public.pagamentos(user_id);
CREATE INDEX idx_pagamentos_assinatura_id ON public.pagamentos(assinatura_id);
CREATE INDEX idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX idx_pagamentos_mp_payment ON public.pagamentos(mp_payment_id);
CREATE INDEX idx_pagamentos_created_at ON public.pagamentos(created_at DESC);

-- Faturas
CREATE INDEX idx_faturas_assinatura_id ON public.faturas(assinatura_id);
CREATE INDEX idx_faturas_user_id ON public.faturas(user_id);
CREATE INDEX idx_faturas_status ON public.faturas(status);
CREATE INDEX idx_faturas_referencia ON public.faturas(referencia_mes);

-- Campanhas
CREATE INDEX idx_campanhas_status ON public.campanhas(status);
CREATE INDEX idx_envios_campanha_id ON public.envios_campanha(campanha_id);
CREATE INDEX idx_envios_user_id ON public.envios_campanha(user_id);
CREATE INDEX idx_envios_status ON public.envios_campanha(status);
CREATE INDEX idx_envios_campanha_status ON public.envios_campanha(campanha_id, status);

-- User Events
CREATE INDEX idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX idx_user_events_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX idx_user_events_user_created ON public.user_events(user_id, created_at DESC);

-- Landing Leads
CREATE INDEX idx_landing_leads_email ON public.landing_leads(email);
CREATE INDEX idx_landing_leads_created_at ON public.landing_leads(created_at DESC);

-- Admin Audit Log
CREATE INDEX idx_audit_log_user_id ON public.admin_audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log(created_at DESC);

-- Log Cobrança
CREATE INDEX idx_log_cobranca_assinatura ON public.log_cobranca(assinatura_id);
CREATE INDEX idx_log_cobranca_created_at ON public.log_cobranca(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Administradoras de Consórcio
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.administradoras (nome, taxa_adm_padrao, fundo_reserva_padrao, lance_embutido_padrao, categorias, planos_disponiveis, ordem) VALUES
  ('Itaú', 20.00, 3.00, 0.300, '["imovel","veiculo","moto","servicos"]', '["linear","reduzida_70_30","reduzida_50_50"]', 1),
  ('Banco do Brasil', 30.90, 3.00, 0.000, '["imovel","veiculo","moto"]', '["linear"]', 2),
  ('Santander', 18.00, 3.00, 0.300, '["imovel","veiculo"]', '["linear","reduzida_70_30","reduzida_50_50"]', 3),
  ('Magalu', 22.00, 3.00, 0.300, '["imovel","veiculo","moto","servicos"]', '["linear","reduzida_70_30","reduzida_50_50"]', 4),
  ('Reconomia', 20.00, 3.00, 0.300, '["imovel","veiculo"]', '["linear","reduzida_70_30","reduzida_50_50"]', 5),
  ('Breitkopf', 19.00, 3.00, 0.300, '["imovel","veiculo"]', '["linear","reduzida_70_30"]', 6),
  ('Âncora', 19.00, 2.00, 0.000, '["imovel"]', '["linear","reduzida_70_30","reduzida_50_50"]', 7);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Régua de Cobrança padrão
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.regras_cobranca (dias_apos_vencimento, acao, template_mensagem) VALUES
  (1, 'whatsapp', 'Olá {{nome}}! Notamos um problema com seu pagamento do SimulaCotas. Pode verificar? Estamos aqui para ajudar! 💚'),
  (3, 'email', 'Olá {{nome}}, seu pagamento do SimulaCotas está pendente há 3 dias. Clique aqui para atualizar: {{link_pagamento}}'),
  (7, 'bloquear', 'Seu acesso ao SimulaCotas foi temporariamente suspenso por pendência financeira. Regularize para continuar usando: {{link_pagamento}}'),
  (30, 'cancelar', 'Sua assinatura do SimulaCotas foi cancelada por inadimplência. Seus dados serão preservados por 90 dias. Para reativar: {{link_reativacao}}');

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Cupons iniciais
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.cupons (codigo, desconto_percentual, max_usos, valido_ate) VALUES
  ('BEMVINDO20', 20.00, 100, NOW() + INTERVAL '90 days'),
  ('VOLTA10', 10.00, 50, NOW() + INTERVAL '60 days');

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Segmentos padrão
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.segmentos_usuarios (nome, descricao, criterios) VALUES
  ('Trial sem conversão (>7d)', 'Corretores que fizeram trial mas não pagaram após 7 dias', '{"status": "trial", "days_since_signup": ">7"}'),
  ('Inadimplentes', 'Corretores com pagamento pendente', '{"status": "inadimplente"}'),
  ('Inativos 30d', 'Corretores pagantes que não geraram proposta em 30 dias', '{"status": "ativo", "days_since_last_proposta": ">30"}'),
  ('Alta atividade', 'Corretores com mais de 20 propostas no mês', '{"status": "ativo", "propostas_mes": ">20"}'),
  ('Novos cadastros', 'Cadastrados nos últimos 7 dias', '{"days_since_signup": "<7"}');

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Templates de email padrão
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.templates_email (nome, assunto, html_content, variaveis) VALUES
  (
    'Boas-vindas',
    'Bem-vindo ao SimulaCotas! 🎉',
    '<h1>Olá {{nome}}!</h1><p>Seu trial de 7 dias começou. Simule propostas de consórcio profissionais em 30 segundos.</p><p><a href="{{link_app}}">Acessar SimulaCotas</a></p>',
    '["{{nome}}","{{link_app}}"]'
  ),
  (
    'Trial expirando',
    'Seu trial expira amanhã — não perca acesso!',
    '<h1>{{nome}}, seu trial acaba amanhã!</h1><p>Já gerou {{propostas_count}} propostas. Continue com o plano Pro por R$ 189,90/mês.</p><p><a href="{{link_upgrade}}">Assinar agora</a></p>',
    '["{{nome}}","{{propostas_count}}","{{link_upgrade}}"]'
  ),
  (
    'Reativação com cupom',
    'Sentimos sua falta! Volte com 20% OFF 🎁',
    '<h1>{{nome}}, volte para o SimulaCotas!</h1><p>Use o cupom <strong>{{cupom}}</strong> e ganhe {{desconto}}% de desconto.</p><p><a href="{{link_reativacao}}">Reativar conta</a></p>',
    '["{{nome}}","{{cupom}}","{{desconto}}","{{link_reativacao}}"]'
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- HABILITAR REALTIME nas tabelas que precisam
-- ═══════════════════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.simulacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.propostas_geradas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assinaturas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pagamentos;
