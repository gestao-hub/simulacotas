-- Seed: chaves de API necessárias pré-cadastradas (valor vazio, prontas para preencher)
-- Só insere se não existir

INSERT INTO public.platform_settings (key, value, category, is_active) VALUES
  ('MP_ACCESS_TOKEN', '', 'payment', false),
  ('RESEND_API_KEY', '', 'email', false),
  ('UAZAPI_URL', '', 'whatsapp', false),
  ('UAZAPI_ADMIN_TOKEN', '', 'whatsapp', false),
  ('UAZAPI_TOKEN', '', 'whatsapp', false)
ON CONFLICT (key) DO NOTHING;
