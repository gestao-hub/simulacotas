-- ============================================================================
-- MIGRATION 004: Tabelas de Billing (assinaturas, pagamentos, cupons, faturas, cobrança)
-- ============================================================================

-- Cupons de desconto
CREATE TABLE public.cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) NOT NULL UNIQUE,
  desconto_percentual DECIMAL(5,2) NOT NULL,
  max_usos INT NOT NULL DEFAULT 100,
  usos_atuais INT NOT NULL DEFAULT 0,
  valido_ate TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assinaturas (Mercado Pago Preapproval)
CREATE TABLE public.assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  tipo public.tipo_assinatura NOT NULL DEFAULT 'individual',
  status public.user_status NOT NULL DEFAULT 'trial',
  mp_preapproval_id VARCHAR(255),
  mp_plan_id VARCHAR(255),
  valor_mensal DECIMAL(10,2) NOT NULL DEFAULT 189.90,
  desconto_aplicado DECIMAL(5,2) DEFAULT 0,
  ciclo public.ciclo_assinatura NOT NULL DEFAULT 'mensal',
  cupom_usado VARCHAR(50),
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_proximo_pagamento TIMESTAMPTZ,
  data_cancelamento TIMESTAMPTZ,
  tentativas_falha INT DEFAULT 0,
  motivo_cancelamento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pagamentos individuais (cada cobrança do MP)
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assinatura_id UUID REFERENCES public.assinaturas(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mp_payment_id VARCHAR(255),
  valor DECIMAL(10,2) NOT NULL,
  status public.status_pagamento NOT NULL DEFAULT 'pending',
  metodo public.metodo_pagamento,
  data_pagamento TIMESTAMPTZ,
  data_vencimento TIMESTAMPTZ,
  mp_response JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faturas mensais
CREATE TABLE public.faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assinatura_id UUID NOT NULL REFERENCES public.assinaturas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  status public.status_fatura NOT NULL DEFAULT 'pendente',
  referencia_mes VARCHAR(7) NOT NULL, -- "2026-03"
  mp_payment_id VARCHAR(255),
  nf_url TEXT,
  paga_em TIMESTAMPTZ,
  vencimento_em TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Régua de cobrança (configurável pelo admin)
CREATE TABLE public.regras_cobranca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dias_apos_vencimento INT NOT NULL,
  acao public.acao_cobranca NOT NULL,
  template_mensagem TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de execução da cobrança
CREATE TABLE public.log_cobranca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assinatura_id UUID NOT NULL REFERENCES public.assinaturas(id) ON DELETE CASCADE,
  regra_id UUID REFERENCES public.regras_cobranca(id) ON DELETE SET NULL,
  acao_executada VARCHAR(100) NOT NULL,
  resultado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER set_assinaturas_updated_at
  BEFORE UPDATE ON public.assinaturas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Função para validar cupom
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code VARCHAR)
RETURNS TABLE(valid BOOLEAN, desconto DECIMAL, mensagem TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _cupom RECORD;
BEGIN
  SELECT * INTO _cupom FROM public.cupons
  WHERE codigo = coupon_code AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Cupom não encontrado'::TEXT;
    RETURN;
  END IF;

  IF _cupom.valido_ate IS NOT NULL AND _cupom.valido_ate < NOW() THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Cupom expirado'::TEXT;
    RETURN;
  END IF;

  IF _cupom.usos_atuais >= _cupom.max_usos THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Cupom esgotado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, _cupom.desconto_percentual, 'Cupom válido'::TEXT;
END;
$$;

-- Função para incrementar uso de cupom
CREATE OR REPLACE FUNCTION public.increment_coupon_uses(coupon_code VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.cupons
  SET usos_atuais = usos_atuais + 1
  WHERE codigo = coupon_code;
END;
$$;
