-- Fix cron jobs: usar URLs hardcoded em vez de current_setting
-- Garante que pg_cron e pg_net estão habilitados

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Remove jobs antigos se existirem (ignora erro se não existem)
SELECT cron.unschedule('process-campaigns-every-30min');
SELECT cron.unschedule('billing-collection-daily-6am');

-- Process Campaigns: a cada 30 minutos
SELECT cron.schedule(
  'process-campaigns-every-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://lacaamciurzbarhqksnk.supabase.co/functions/v1/process-campaigns',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhY2FhbWNpdXJ6YmFyaHFrc25rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NzgxMSwiZXhwIjoyMDkwMTMzODExfQ.KrM_C0rqm6lCHme4CpA2BvDV-Yc9AiG5xVvdF3D6bnI", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Billing Collection: todos os dias às 9h UTC (6h BRT)
SELECT cron.schedule(
  'billing-collection-daily-6am',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lacaamciurzbarhqksnk.supabase.co/functions/v1/billing-collection',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhY2FhbWNpdXJ6YmFyaHFrc25rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NzgxMSwiZXhwIjoyMDkwMTMzODExfQ.KrM_C0rqm6lCHme4CpA2BvDV-Yc9AiG5xVvdF3D6bnI", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
