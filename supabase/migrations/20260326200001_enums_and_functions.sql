-- ============================================================================
-- MIGRATION 001: Enums e Funções Base (sem dependência de tabelas)
-- SimulaCotas — SaaS para corretores de consórcio
-- ============================================================================

-- Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums de roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'empresa_admin', 'corretor');

-- Enums de status
CREATE TYPE public.user_status AS ENUM ('trial', 'ativo', 'inadimplente', 'cancelado', 'suspenso');
CREATE TYPE public.categoria_consorcio AS ENUM ('imovel', 'veiculo', 'moto', 'servicos');
CREATE TYPE public.plano_consorcio AS ENUM ('linear', 'reduzida_70_30', 'reduzida_50_50');
CREATE TYPE public.variante_plano AS ENUM ('normal', '12_meses');
CREATE TYPE public.canal_compartilhamento AS ENUM ('whatsapp', 'email', 'link', 'download');
CREATE TYPE public.formato_proposta AS ENUM ('pdf', 'whatsapp_text', 'link');

-- Enums de billing
CREATE TYPE public.ciclo_assinatura AS ENUM ('mensal', 'anual', 'anual_vista');
CREATE TYPE public.tipo_assinatura AS ENUM ('individual', 'empresa');
CREATE TYPE public.status_pagamento AS ENUM ('pending', 'approved', 'rejected', 'refunded', 'in_process');
CREATE TYPE public.metodo_pagamento AS ENUM ('credit_card', 'boleto', 'pix', 'debit_card');
CREATE TYPE public.status_fatura AS ENUM ('pendente', 'paga', 'vencida', 'cancelada');
CREATE TYPE public.acao_cobranca AS ENUM ('whatsapp', 'email', 'alerta_interno', 'bloquear', 'cancelar');

-- Enums de campanhas
CREATE TYPE public.status_campanha AS ENUM ('rascunho', 'ativa', 'pausada', 'concluida');
CREATE TYPE public.canal_campanha AS ENUM ('email', 'whatsapp', 'ambos');
CREATE TYPE public.status_envio AS ENUM ('enviado', 'falhou', 'aberto', 'clicado');
CREATE TYPE public.setting_category AS ENUM ('payment', 'email', 'whatsapp', 'analytics');

-- Criptografia de settings (API keys) — sem dependência de tabelas
CREATE OR REPLACE FUNCTION public.encrypt_setting(plain_text TEXT, encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(
    encrypt(
      convert_to(plain_text, 'utf8'),
      convert_to(encryption_key, 'utf8'),
      'aes'
    ),
    'base64'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_setting(encrypted_text TEXT, encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN convert_from(
    decrypt(
      decode(encrypted_text, 'base64'),
      convert_to(encryption_key, 'utf8'),
      'aes'
    ),
    'utf8'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

-- Função genérica de updated_at — sem dependência de tabelas
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
