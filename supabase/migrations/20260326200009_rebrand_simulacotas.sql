-- ============================================================================
-- MIGRATION 009: Rebranding PiperHub → SimulaCotas
-- Atualiza textos de seed data nas tabelas regras_cobranca e templates_email
-- ============================================================================

-- Régua de cobrança
UPDATE public.regras_cobranca
SET template_mensagem = REPLACE(template_mensagem, 'PiperHub', 'SimulaCotas')
WHERE template_mensagem LIKE '%PiperHub%';

-- Templates de email — assunto
UPDATE public.templates_email
SET assunto = REPLACE(assunto, 'PiperHub', 'SimulaCotas')
WHERE assunto LIKE '%PiperHub%';

-- Templates de email — conteúdo HTML
UPDATE public.templates_email
SET html_content = REPLACE(html_content, 'PiperHub', 'SimulaCotas')
WHERE html_content LIKE '%PiperHub%';
