-- Fix: logo maior em card branco nos templates de email

-- O header antigo era:
-- <img src="...logo.png" height="40" style="height:40px">
-- Novo header: logo em container branco arredondado, height=80px

-- Boas-vindas
UPDATE public.templates_email
SET html_content = REPLACE(
  html_content,
  '<img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="40" style="height:40px">',
  '<div style="display:inline-block;background-color:#ffffff;border-radius:12px;padding:12px 24px"><img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="80" style="height:80px"></div>'
)
WHERE nome = 'Boas-vindas';

-- Trial expirando
UPDATE public.templates_email
SET html_content = REPLACE(
  html_content,
  '<img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="40" style="height:40px">',
  '<div style="display:inline-block;background-color:#ffffff;border-radius:12px;padding:12px 24px"><img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="80" style="height:80px"></div>'
)
WHERE nome = 'Trial expirando';

-- Reativação com cupom
UPDATE public.templates_email
SET html_content = REPLACE(
  html_content,
  '<img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="40" style="height:40px">',
  '<div style="display:inline-block;background-color:#ffffff;border-radius:12px;padding:12px 24px"><img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="80" style="height:80px"></div>'
)
WHERE nome = 'Reativação com cupom';

-- Reset de senha
UPDATE public.templates_email
SET html_content = REPLACE(
  html_content,
  '<img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="40" style="height:40px">',
  '<div style="display:inline-block;background-color:#ffffff;border-radius:12px;padding:12px 24px"><img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="80" style="height:80px"></div>'
)
WHERE nome = 'Reset de senha';

-- Confirmação de conta
UPDATE public.templates_email
SET html_content = REPLACE(
  html_content,
  '<img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="40" style="height:40px">',
  '<div style="display:inline-block;background-color:#ffffff;border-radius:12px;padding:12px 24px"><img src="https://simulacotas.vercel.app/assets/logo.png" alt="SimulaCotas" height="80" style="height:80px"></div>'
)
WHERE nome = 'Confirmação de conta';
