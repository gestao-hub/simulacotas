-- ============================================================================
-- MIGRATION 003: Tabelas Core (administradoras, simulações, propostas, clientes)
-- ============================================================================

-- Administradoras de consórcio
CREATE TABLE public.administradoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  logo_url TEXT,
  taxa_adm_padrao DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  fundo_reserva_padrao DECIMAL(5,2) NOT NULL DEFAULT 3.00,
  lance_embutido_padrao DECIMAL(5,3) NOT NULL DEFAULT 0.300,
  categorias JSONB NOT NULL DEFAULT '["imovel","veiculo"]'::jsonb,
  planos_disponiveis JSONB NOT NULL DEFAULT '["linear","reduzida_70_30","reduzida_50_50"]'::jsonb,
  configuracoes_extras JSONB DEFAULT '{}'::jsonb, -- taxas específicas por categoria, etc.
  is_active BOOLEAN DEFAULT TRUE,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulações realizadas
CREATE TABLE public.simulacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cliente_nome VARCHAR(255),
  cliente_telefone VARCHAR(20),
  administradora_id UUID NOT NULL REFERENCES public.administradoras(id),
  categoria public.categoria_consorcio NOT NULL DEFAULT 'imovel',
  plano public.plano_consorcio NOT NULL DEFAULT 'linear',
  variante public.variante_plano NOT NULL DEFAULT 'normal',
  -- Dados de entrada (o que o corretor preencheu)
  dados_entrada JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
    Estrutura esperada de dados_entrada:
    {
      "valor_bem": 400000,
      "prazo": 200,
      "qtde_cotas": 1,
      "taxa_adm": 20,
      "fundo_reserva": 3,
      "lance_percentual": 50,
      "lance_embutido_percentual": 0.3,
      -- Para 70/30: array de cotas
      "cotas": [
        {"vencimento": 5, "grupo": 40201, "prazo": 222, "valor_bem": 309000, "lance_percentual": 40},
        ...
      ]
    }
  */
  -- Dados calculados (resultado completo)
  dados_calculados JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
    Estrutura esperada de dados_calculados:
    {
      "percentual_mensal": 0.115,
      "valor_total": 400000,
      "parcela_base": 2000,
      "valor_bem_taxas": 446000,
      "lance_total": 200000,
      "lance_embutido": 1200,
      "lance_recursos_proprios": 198800,
      "credito_liquido": 398800,
      "parcela_pos_lance": 1220.10,
      "juros_operacao": 46000
    }
  */
  -- Resumo rápido (para listagem)
  resumo JSONB NOT NULL DEFAULT '{}'::jsonb,
  /*
    {
      "carta_credito": 400000,
      "parcela_inicial": 2000,
      "parcela_pos_lance": 1220.10,
      "credito_liquido": 398800,
      "prazo_meses": 200,
      "recursos_proprios": 198800
    }
  */
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Propostas geradas (PDFs, textos WhatsApp, links)
CREATE TABLE public.propostas_geradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulacao_id UUID NOT NULL REFERENCES public.simulacoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pdf_url TEXT,
  formato public.formato_proposta NOT NULL DEFAULT 'pdf',
  compartilhada_em TIMESTAMPTZ,
  canal_compartilhamento public.canal_compartilhamento,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes do corretor (CRM básico)
CREATE TABLE public.clientes_corretor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers de updated_at
CREATE TRIGGER set_administradoras_updated_at
  BEFORE UPDATE ON public.administradoras
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_clientes_corretor_updated_at
  BEFORE UPDATE ON public.clientes_corretor
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Incrementar contadores no profile ao criar simulação/proposta
CREATE OR REPLACE FUNCTION public.increment_simulacao_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET simulacoes_count = simulacoes_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_proposta_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET propostas_count = propostas_count + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_simulacao_created
  AFTER INSERT ON public.simulacoes
  FOR EACH ROW EXECUTE FUNCTION public.increment_simulacao_count();

CREATE TRIGGER on_proposta_created
  AFTER INSERT ON public.propostas_geradas
  FOR EACH ROW EXECUTE FUNCTION public.increment_proposta_count();
