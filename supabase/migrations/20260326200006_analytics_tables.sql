-- ============================================================================
-- MIGRATION 006: Tabelas de Analytics e Auditoria
-- ============================================================================

-- Eventos de usuário (rastreamento de ações)
CREATE TABLE public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  /*
    Tipos de evento:
    - login, logout
    - simulacao_criada, simulacao_visualizada
    - proposta_gerada, proposta_compartilhada
    - trial_iniciado, trial_expirado
    - pagamento_aprovado, pagamento_falhou
    - upgrade, downgrade, cancelamento
    - onboarding_concluido
    - admin_selecionada (qual administradora)
    - plano_selecionado (linear, 70/30, 50/50)
  */
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads da landing page (não convertidos)
CREATE TABLE public.landing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(20),
  session_id VARCHAR(100),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  simulou_na_landing BOOLEAN DEFAULT FALSE,
  dados_simulacao JSONB, -- dados da simulação feita na landing (sem login)
  converteu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações da plataforma (API keys criptografadas)
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL, -- criptografado
  category public.setting_category NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de auditoria admin
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para platform_settings
CREATE TRIGGER set_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
