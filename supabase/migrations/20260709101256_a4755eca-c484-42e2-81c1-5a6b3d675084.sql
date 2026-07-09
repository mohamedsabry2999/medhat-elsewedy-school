
-- Media library table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  alt_text text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  storage_path text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'أخرى',
  status text NOT NULL DEFAULT 'published',
  usage_locations text[] NOT NULL DEFAULT '{}',
  display_position text NOT NULL DEFAULT '',
  focal_x integer NOT NULL DEFAULT 50,
  focal_y integer NOT NULL DEFAULT 50,
  aspect_ratio text NOT NULL DEFAULT '',
  crop_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  width integer NOT NULL DEFAULT 0,
  height integer NOT NULL DEFAULT 0,
  file_size integer NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published media"
  ON public.media_assets FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admin can read all media"
  ON public.media_assets FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can insert media"
  ON public.media_assets FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update media"
  ON public.media_assets FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete media"
  ON public.media_assets FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TRIGGER media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_media_assets_status ON public.media_assets(status);
CREATE INDEX idx_media_assets_category ON public.media_assets(category);
CREATE INDEX idx_media_assets_display_position ON public.media_assets(display_position);
CREATE INDEX idx_media_assets_sort_order ON public.media_assets(sort_order);

ALTER PUBLICATION supabase_realtime ADD TABLE public.media_assets;

-- Storage policies for the 'media' bucket (private bucket, anon reads allowed via signed URLs / direct object endpoint)
CREATE POLICY "Public can read media objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Admin can insert media objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admin can update media objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admin can delete media objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
