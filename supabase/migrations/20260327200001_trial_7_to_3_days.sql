-- Migration: Trial de 7 dias → 3 dias
-- Altera o default para novos signups e ajusta usuários existentes em trial

-- 1. Mudar default para novos signups
ALTER TABLE public.profiles
  ALTER COLUMN trial_ends_at SET DEFAULT (NOW() + INTERVAL '3 days');

-- 2. Ajustar trial users existentes (encurtar para 3 dias desde signup)
UPDATE public.profiles
SET trial_ends_at = created_at + INTERVAL '3 days'
WHERE status = 'trial'
  AND trial_ends_at > created_at + INTERVAL '3 days';

-- 3. Atualizar segmentos
UPDATE public.segmentos_usuarios
SET nome = 'Trial sem conversão (>3d)',
    descricao = 'Corretores que fizeram trial mas não pagaram após 3 dias',
    criterios = '{"status": "trial", "days_since_signup": ">3"}'
WHERE nome LIKE 'Trial sem conversão%';

UPDATE public.segmentos_usuarios
SET descricao = 'Cadastrados nos últimos 3 dias',
    criterios = '{"days_since_signup": "<3"}'
WHERE nome = 'Novos cadastros';

-- 4. Atualizar template email boas-vindas
UPDATE public.templates_email
SET html_content = REPLACE(html_content, '7 dias', '3 dias')
WHERE nome = 'Boas-vindas';
