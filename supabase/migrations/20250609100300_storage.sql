-- =============================================================================
-- Tilouki — Supabase Storage : bucket product-images
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10 Mo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lecture publique des images produits
CREATE POLICY "product_images_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Upload / mise à jour / suppression : admin uniquement
CREATE POLICY "product_images_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND private.is_admin()
  );

CREATE POLICY "product_images_storage_admin_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'product-images' AND private.is_admin());

CREATE POLICY "product_images_storage_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND private.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND private.is_admin());

CREATE POLICY "product_images_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND private.is_admin());
