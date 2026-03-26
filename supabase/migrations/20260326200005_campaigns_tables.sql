-- ============================================================================
-- MIGRATION 005: Tabelas de Campanhas e Remarketing
-- ============================================================================

-- Segmentos de usuários (para targeting)
CREATE TABLE public.segmentos_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  criterios JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
    Exemplos de critérios:
    {"status": "trial", "days_since_signup": ">7"}
    {"status": "inadimplente", "dias_vencido": ">3"}
    {"status": "ativo", "propostas_count": "<4", "days_since_last_login": ">30"}
    {"utm_source": "google"}
  */
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de email
CREATE TABLE public.templates_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  assunto VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  variaveis JSONB DEFAULT '["{{nome}}","{{plano}}","{{valor}}"]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campanhas de remarketing
CREATE TABLE public.campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  status public.status_campanha NOT NULL DEFAULT 'rascunho',
  tipo_trigger VARCHAR(100),
  /*
    Triggers disponíveis:
    - manual
    - signup_sem_trial_1d
    - signup_sem_trial_3d
    - trial_sem_pagamento_7d
    - trial_sem_pagamento_14d
    - inativo_30d
    - inadimplente_3d
    - aniversario_assinatura
  */
  segmento_id UUID REFERENCES public.segmentos_usuarios(id) ON DELETE SET NULL,
  cupom_id UUID REFERENCES public.cupons(id) ON DELETE SET NULL,
  canal public.canal_campanha NOT NULL DEFAULT 'email',
  template_email_id UUID REFERENCES public.templates_email(id) ON DELETE SET NULL,
  template_whatsapp TEXT,
  enviados_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Envios de campanhas (rastreamento individual)
CREATE TABLE public.envios_campanha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id UUID NOT NULL REFERENCES public.campanhas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  canal public.canal_campanha NOT NULL,
  status public.status_envio NOT NULL DEFAULT 'enviado',
  enviado_em TIMESTAMPTZ DEFAULT NOW(),
  aberto_em TIMESTAMPTZ,
  clicado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preferências de comunicação (LGPD)
CREATE TABLE public.preferencias_comunicacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_opt_in BOOLEAN DEFAULT TRUE,
  whatsapp_opt_in BOOLEAN DEFAULT TRUE,
  unsubscribe_token VARCHAR(100) UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text || gen_random_uuid()::text),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER set_templates_email_updated_at
  BEFORE UPDATE ON public.templates_email
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_campanhas_updated_at
  BEFORE UPDATE ON public.campanhas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-criar preferências de comunicação ao criar profile
CREATE OR REPLACE FUNCTION public.handle_new_profile_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.preferencias_comunicacao (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_preferences
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_preferences();
