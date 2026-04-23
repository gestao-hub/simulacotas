-- Fix: garantir que o admin principal tem role super_admin
-- O trigger handle_new_user cria todos como 'corretor' por padrão
-- O admin precisa ter 'super_admin' para acessar platform_settings (RLS)

-- Adicionar super_admin para o admin principal (by email)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'super_admin'::public.app_role
FROM public.profiles p
WHERE p.email = 'gestao@excluvia.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role = 'super_admin'
  );

-- Também adicionar para qualquer outro email de admin que possa existir
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'super_admin'::public.app_role
FROM public.profiles p
WHERE p.email = 'contato@excluvia.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role = 'super_admin'
  );
