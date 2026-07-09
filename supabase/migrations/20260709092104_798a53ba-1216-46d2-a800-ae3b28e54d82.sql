
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  thumbnail text,
  focal_x numeric NOT NULL DEFAULT 50,
  focal_y numeric NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft','hidden')),
  featured boolean NOT NULL DEFAULT false,
  author text NOT NULL DEFAULT 'إدارة المدرسة',
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  og_image text NOT NULL DEFAULT '',
  image_alt text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published articles" ON public.articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admin reads all articles" ON public.articles FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admin writes articles" ON public.articles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  image_alt text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published gallery" ON public.gallery_images FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admin reads all gallery" ON public.gallery_images FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admin writes gallery" ON public.gallery_images FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER gallery_updated_at BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone text NOT NULL DEFAULT '01050360883',
  email text NOT NULL DEFAULT 'school@elsewedyprint.com',
  facebook_url text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  youtube_url text NOT NULL DEFAULT '',
  whatsapp_url text NOT NULL DEFAULT '',
  footer_description text NOT NULL DEFAULT 'مدرسة مدحت السويدي للتكنولوجيا التطبيقية — تعليم فني متخصص في تكنولوجيا الطباعة، بالشراكة مع دار مدحت السويدي للطباعة وباعتماد الغرفة الألمانية AHK Cairo.',
  main_cta text NOT NULL DEFAULT 'سجل الآن لحضور الندوة التعريفية',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin updates site settings" ON public.site_settings FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  usage text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads branches" ON public.branches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin writes branches" ON public.branches FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE TRIGGER branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.branches (name, address, usage, position) VALUES
  ('فرع الحي الخامس عشر', 'بجوار مدرسة أحمد زويل الثانوية بنات، الحي الخامس عشر، العاشر من رمضان، الشرقية، مصر.', 'استقبال أولياء الأمور والطلاب في الندوات التعريفية حسب المواعيد المعلنة.', 1),
  ('فرع المنطقة الصناعية', 'قطعة رقم 68، المنطقة الصناعية 4A، مدينة العاشر من رمضان، مصر.', 'التدريب العملي والميداني داخل بيئة صناعية مرتبطة بالشريك الصناعي دار مدحت السويدي للطباعة.', 2);

ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.branches;
