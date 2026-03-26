-- ============================================================================
-- MIGRATION 007: Row Level Security (RLS) Policies
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin vê todos os profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Empresa admin vê profiles da sua empresa"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'empresa_admin')
    AND empresa_id = public.get_user_empresa_id(auth.uid())
    AND empresa_id IS NOT NULL
  );

CREATE POLICY "Corretor vê próprio profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Corretor atualiza próprio profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admin atualiza qualquer profile"
  ON public.profiles FOR UPDATE
  USING (public.is_super_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- USER_ROLES
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia todos os roles"
  ON public.user_roles FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Usuário vê próprio role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- EMPRESAS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia todas as empresas"
  ON public.empresas FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Empresa admin vê e edita sua empresa"
  ON public.empresas FOR SELECT
  USING (admin_user_id = auth.uid() OR id = public.get_user_empresa_id(auth.uid()));

CREATE POLICY "Empresa admin atualiza sua empresa"
  ON public.empresas FOR UPDATE
  USING (admin_user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- ADMINISTRADORAS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.administradoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia administradoras"
  ON public.administradoras FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Todos leem administradoras ativas"
  ON public.administradoras FOR SELECT
  USING (is_active = TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- SIMULACOES
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin lê todas as simulações"
  ON public.simulacoes FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Empresa admin vê simulações da empresa"
  ON public.simulacoes FOR SELECT
  USING (
    public.has_role(auth.uid(), 'empresa_admin')
    AND public.same_empresa(user_id)
  );

CREATE POLICY "Corretor CRUD próprias simulações"
  ON public.simulacoes FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PROPOSTAS_GERADAS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.propostas_geradas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin lê todas as propostas"
  ON public.propostas_geradas FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Empresa admin vê propostas da empresa"
  ON public.propostas_geradas FOR SELECT
  USING (
    public.has_role(auth.uid(), 'empresa_admin')
    AND public.same_empresa(user_id)
  );

CREATE POLICY "Corretor CRUD próprias propostas"
  ON public.propostas_geradas FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENTES_CORRETOR
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.clientes_corretor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin lê todos os clientes"
  ON public.clientes_corretor FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Empresa admin vê clientes da empresa"
  ON public.clientes_corretor FOR SELECT
  USING (
    public.has_role(auth.uid(), 'empresa_admin')
    AND public.same_empresa(user_id)
  );

CREATE POLICY "Corretor CRUD próprios clientes"
  ON public.clientes_corretor FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ASSINATURAS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia todas as assinaturas"
  ON public.assinaturas FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Empresa admin vê assinaturas da empresa"
  ON public.assinaturas FOR SELECT
  USING (
    public.has_role(auth.uid(), 'empresa_admin')
    AND (
      user_id = auth.uid()
      OR empresa_id = public.get_user_empresa_id(auth.uid())
    )
  );

CREATE POLICY "Corretor vê própria assinatura"
  ON public.assinaturas FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PAGAMENTOS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin vê todos os pagamentos"
  ON public.pagamentos FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Corretor vê próprios pagamentos"
  ON public.pagamentos FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- FATURAS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia faturas"
  ON public.faturas FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Corretor vê próprias faturas"
  ON public.faturas FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- CUPONS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia cupons"
  ON public.cupons FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Todos leem cupons ativos"
  ON public.cupons FOR SELECT
  USING (is_active = TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- REGRAS_COBRANCA
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.regras_cobranca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia regras"
  ON public.regras_cobranca FOR ALL
  USING (public.is_super_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- LOG_COBRANCA
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.log_cobranca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin vê log de cobrança"
  ON public.log_cobranca FOR SELECT
  USING (public.is_super_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- CAMPANHAS E RELACIONADOS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.segmentos_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_campanha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia segmentos" ON public.segmentos_usuarios FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admin gerencia campanhas" ON public.campanhas FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admin gerencia templates" ON public.templates_email FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admin gerencia envios" ON public.envios_campanha FOR ALL USING (public.is_super_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- PREFERENCIAS_COMUNICACAO
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.preferencias_comunicacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin vê todas as preferências"
  ON public.preferencias_comunicacao FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Corretor gerencia próprias preferências"
  ON public.preferencias_comunicacao FOR ALL
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- USER_EVENTS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin vê todos os eventos"
  ON public.user_events FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Corretor vê próprios eventos"
  ON public.user_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role insere eventos"
  ON public.user_events FOR INSERT
  WITH CHECK (TRUE); -- Edge functions usam service_role

-- ═══════════════════════════════════════════════════════════════════════════
-- LANDING_LEADS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin vê leads"
  ON public.landing_leads FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Service role insere leads"
  ON public.landing_leads FOR INSERT
  WITH CHECK (TRUE); -- Landing page usa anon key + edge function

-- ═══════════════════════════════════════════════════════════════════════════
-- PLATFORM_SETTINGS
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gerencia configurações"
  ON public.platform_settings FOR ALL
  USING (public.is_super_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- ADMIN_AUDIT_LOG
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin lê audit log"
  ON public.admin_audit_log FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Service role insere audit log"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (TRUE); -- Edge functions logam ações
