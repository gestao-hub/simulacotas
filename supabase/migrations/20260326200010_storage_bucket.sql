-- ============================================================================
-- MIGRATION 010: Storage Bucket para logos dos corretores
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('corretor-assets', 'corretor-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Política: corretores podem fazer upload do próprio logo
CREATE POLICY "Corretores fazem upload dos próprios assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'corretor-assets'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'logos'
  );

-- Política: qualquer pessoa pode ler assets (logos são públicos)
CREATE POLICY "Assets de corretores são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'corretor-assets');

-- Política: corretor pode atualizar/deletar próprio logo
CREATE POLICY "Corretores gerenciam próprios assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'corretor-assets'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Corretores deletam próprios assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'corretor-assets'
    AND auth.uid() IS NOT NULL
  );
