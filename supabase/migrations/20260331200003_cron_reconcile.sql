-- Cron job: reconciliação diária com Asaas
-- Roda às 10h UTC (7h BRT) — 1h após billing-collection

SELECT cron.schedule(
  'asaas-reconcile-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lacaamciurzbarhqksnk.supabase.co/functions/v1/asaas-reconcile',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhY2FhbWNpdXJ6YmFyaHFrc25rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NzgxMSwiZXhwIjoyMDkwMTMzODExfQ.KrM_C0rqm6lCHme4CpA2BvDV-Yc9AiG5xVvdF3D6bnI", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
