-- Graduate batches
CREATE TABLE public.graduate_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  graduation_year INTEGER,
  graduates_count INTEGER,
  excerpt TEXT,
  description TEXT,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  featured_on_home BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.graduate_batches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.graduate_batches TO authenticated;
GRANT ALL ON public.graduate_batches TO service_role;

ALTER TABLE public.graduate_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published batches"
  ON public.graduate_batches FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Authenticated can read all batches"
  ON public.graduate_batches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert batches"
  ON public.graduate_batches FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update batches"
  ON public.graduate_batches FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete batches"
  ON public.graduate_batches FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER graduate_batches_updated_at
  BEFORE UPDATE ON public.graduate_batches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_graduate_batches_status ON public.graduate_batches(status);
CREATE INDEX idx_graduate_batches_sort ON public.graduate_batches(sort_order);

-- Graduate batch media (images/videos)
CREATE TABLE public.graduate_batch_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.graduate_batches(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image',
  title TEXT,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  embed_url TEXT,
  alt_text TEXT,
  category TEXT,
  focal_x NUMERIC DEFAULT 0.5,
  focal_y NUMERIC DEFAULT 0.35,
  status TEXT NOT NULL DEFAULT 'published',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.graduate_batch_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.graduate_batch_media TO authenticated;
GRANT ALL ON public.graduate_batch_media TO service_role;

ALTER TABLE public.graduate_batch_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published media of published batches"
  ON public.graduate_batch_media FOR SELECT
  TO anon
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.graduate_batches b
      WHERE b.id = batch_id AND b.status = 'published'
    )
  );

CREATE POLICY "Authenticated can read all media"
  ON public.graduate_batch_media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert media"
  ON public.graduate_batch_media FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update media"
  ON public.graduate_batch_media FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete media"
  ON public.graduate_batch_media FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER graduate_batch_media_updated_at
  BEFORE UPDATE ON public.graduate_batch_media
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_graduate_batch_media_batch ON public.graduate_batch_media(batch_id);
CREATE INDEX idx_graduate_batch_media_sort ON public.graduate_batch_media(sort_order);