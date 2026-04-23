-- Limpar dados de sandbox do Asaas para migração ao ambiente de produção
-- Os IDs de customer/subscription do sandbox não existem no ambiente de produção

-- Limpar customer e subscription IDs dos profiles (sandbox)
UPDATE profiles
SET asaas_customer_id = NULL,
    asaas_subscription_id = NULL
WHERE asaas_customer_id IS NOT NULL;

-- Limpar assinaturas de teste (sandbox)
-- Manter registros mas limpar referências ao Asaas sandbox
UPDATE assinaturas
SET asaas_subscription_id = NULL,
    asaas_customer_id = NULL
WHERE asaas_subscription_id IS NOT NULL;
