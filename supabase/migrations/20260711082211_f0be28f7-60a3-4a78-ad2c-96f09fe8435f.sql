
-- Content Blocks: every editable text on the site
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  page_slug TEXT NOT NULL DEFAULT 'global',
  section_key TEXT NOT NULL DEFAULT 'general',
  label TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text','textarea','richtext','button','label','message','seo','alt')),
  default_value TEXT NOT NULL DEFAULT '',
  current_value TEXT NOT NULL DEFAULT '',
  draft_value TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft')),
  sort_order INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_page ON public.content_blocks(page_slug);
CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON public.content_blocks(page_slug, section_key);

GRANT SELECT ON public.content_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_blocks TO authenticated;
GRANT ALL ON public.content_blocks TO service_role;

ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_blocks public read"
  ON public.content_blocks FOR SELECT
  USING (true);

CREATE POLICY "content_blocks admin write"
  ON public.content_blocks FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- allow anon (site visitors) to auto-register missing keys via upsert of new rows only.
-- Only INSERT is allowed for anon; UPDATE/DELETE remain admin-only via the policy above.
CREATE POLICY "content_blocks anon register"
  ON public.content_blocks FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE TRIGGER trg_content_blocks_updated
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Version history
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL,
  old_value TEXT NOT NULL DEFAULT '',
  new_value TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published',
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_versions_key ON public.content_versions(content_key, created_at DESC);

GRANT SELECT, INSERT ON public.content_versions TO authenticated;
GRANT ALL ON public.content_versions TO service_role;

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_versions admin read"
  ON public.content_versions FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "content_versions admin insert"
  ON public.content_versions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_blocks;
