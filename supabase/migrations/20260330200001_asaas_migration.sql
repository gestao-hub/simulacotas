-- Migração: Mercado Pago → Asaas
-- Renomear colunas mp_* para asaas_* e configurar platform_settings

-- profiles: mp_customer_id → asaas_customer_id, mp_preapproval_id → asaas_subscription_id
ALTER TABLE profiles RENAME COLUMN mp_customer_id TO asaas_customer_id;
ALTER TABLE profiles RENAME COLUMN mp_preapproval_id TO asaas_subscription_id;

-- assinaturas: mp_preapproval_id → asaas_subscription_id, mp_plan_id → asaas_customer_id
ALTER TABLE assinaturas RENAME COLUMN mp_preapproval_id TO asaas_subscription_id;
ALTER TABLE assinaturas RENAME COLUMN mp_plan_id TO asaas_customer_id;

-- pagamentos: mp_payment_id → asaas_payment_id, mp_response → asaas_response
ALTER TABLE pagamentos RENAME COLUMN mp_payment_id TO asaas_payment_id;
ALTER TABLE pagamentos RENAME COLUMN mp_response TO asaas_response;

-- faturas: mp_payment_id → asaas_payment_id
ALTER TABLE faturas RENAME COLUMN mp_payment_id TO asaas_payment_id;

-- Adicionar ASAAS_API_KEY e ASAAS_WEBHOOK_TOKEN no platform_settings
INSERT INTO platform_settings (category, key, value, is_active)
VALUES
  ('payment', 'ASAAS_API_KEY', '', true),
  ('payment', 'ASAAS_WEBHOOK_TOKEN', '', true)
ON CONFLICT (key) DO NOTHING;

-- Desativar MP_ACCESS_TOKEN
UPDATE platform_settings SET is_active = false WHERE key = 'MP_ACCESS_TOKEN';
