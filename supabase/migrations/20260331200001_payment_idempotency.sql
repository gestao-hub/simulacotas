-- Adicionar constraint UNIQUE em asaas_payment_id para garantir idempotência nos webhooks
-- Sem isso, o upsert com onConflict não funciona corretamente e webhooks duplicados criam registros duplicados

-- Primeiro remover duplicatas se existirem (manter o mais recente)
DELETE FROM pagamentos a
USING pagamentos b
WHERE a.id < b.id
  AND a.asaas_payment_id IS NOT NULL
  AND a.asaas_payment_id = b.asaas_payment_id;

-- Agora criar a constraint
ALTER TABLE pagamentos
  ADD CONSTRAINT pagamentos_asaas_payment_id_unique UNIQUE (asaas_payment_id);
