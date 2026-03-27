-- Remover Reconomia
DELETE FROM public.administradoras WHERE nome = 'Reconomia';

-- Popular logo_url com assets estáticos existentes
UPDATE public.administradoras SET logo_url = '/assets/banco-do-brasil.png' WHERE nome = 'Banco do Brasil';
UPDATE public.administradoras SET logo_url = '/assets/santander.png' WHERE nome = 'Santander';
UPDATE public.administradoras SET logo_url = '/assets/magalu.png' WHERE nome = 'Magalu';
UPDATE public.administradoras SET logo_url = '/assets/bkf.png' WHERE nome = 'Breitkopf';
UPDATE public.administradoras SET logo_url = '/assets/ancora.webp' WHERE nome = 'Âncora';
-- Itaú usa URL externa por enquanto
UPDATE public.administradoras SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banco_Ita%C3%BA_logo.svg/200px-Banco_Ita%C3%BA_logo.svg.png' WHERE nome = 'Itaú';

-- Bucket para logos de administradoras
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-logos', 'admin-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para admin-logos bucket
CREATE POLICY "Super admin pode fazer upload de logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'admin-logos'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Qualquer um pode ver logos de admins" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'admin-logos');

CREATE POLICY "Super admin pode atualizar logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'admin-logos'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin pode deletar logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'admin-logos'
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );
