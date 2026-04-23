-- Garantir que as chaves existem E têm o valor correto
-- O INSERT da migration anterior pode ter falhado se o registro não existia

-- Primeiro inserir caso não existam
INSERT INTO platform_settings (category, key, value, is_active)
VALUES
  ('payment', 'ASAAS_API_KEY', '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhmMzk2NGM4LThiYmQtNDE2ZS05NzcxLTVmMTQ0OGZkZGQyNzo6JGFhY2hfNjcyNzJlMzYtNjJlMy00ZTVmLWE5ZGUtYzI2NzgyMzkzNzM4', true),
  ('payment', 'ASAAS_WEBHOOK_TOKEN', '', true)
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      is_active = EXCLUDED.is_active;
