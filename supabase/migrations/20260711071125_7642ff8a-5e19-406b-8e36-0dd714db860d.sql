
-- pages table
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  robots TEXT NOT NULL DEFAULT 'index,follow',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published pages" ON public.pages
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert pages" ON public.pages
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pages" ON public.pages
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pages" ON public.pages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- page_sections table
CREATE TABLE public.page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'generic',
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  data_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  cta_text TEXT NOT NULL DEFAULT '',
  cta_url TEXT NOT NULL DEFAULT '',
  cta_text_2 TEXT NOT NULL DEFAULT '',
  cta_url_2 TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_slug, section_key)
);

CREATE INDEX idx_page_sections_page ON public.page_sections(page_slug, sort_order);

GRANT SELECT ON public.page_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_sections TO authenticated;
GRANT ALL ON public.page_sections TO service_role;

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sections" ON public.page_sections
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert sections" ON public.page_sections
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sections" ON public.page_sections
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sections" ON public.page_sections
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_page_sections_updated_at BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_sections;

-- Seed pages
INSERT INTO public.pages (slug, title, meta_title, meta_description) VALUES
  ('home', 'الصفحة الرئيسية', 'مدرسة مدحت السويدي للتكنولوجيا التطبيقية', 'أول مدرسة تكنولوجيا تطبيقية متخصصة في الطباعة والتغليف في مصر — باعتماد الغرفة الألمانية AHK Cairo.'),
  ('about', 'عن المدرسة', 'عن مدرسة مدحت السويدي', 'تعرف على المدرسة ورؤيتها ورسالتها واعتماداتها الدولية.'),
  ('programs', 'التخصصات', 'التخصصات — مدرسة مدحت السويدي', 'تخصصات معتمدة دوليًا في الطباعة والتغليف.'),
  ('study-system', 'نظام الدراسة', 'نظام الدراسة — مدرسة مدحت السويدي', 'نظام الساعات المعتمدة والتدريب العملي والميداني.'),
  ('admissions', 'التقديم والقبول', 'التقديم والقبول — مدرسة مدحت السويدي', 'شروط الالتحاق وخطوات التقديم.'),
  ('visit', 'الندوات التعريفية', 'الندوات التعريفية — مدرسة مدحت السويدي', 'احجز زيارة تعريفية للمدرسة.'),
  ('news', 'الأخبار', 'الأخبار — مدرسة مدحت السويدي', 'آخر أخبار وأنشطة المدرسة.'),
  ('gallery', 'معرض الصور', 'معرض الصور — مدرسة مدحت السويدي', 'صور من داخل المدرسة والورش والفعاليات.'),
  ('faq', 'الأسئلة الشائعة', 'الأسئلة الشائعة — مدرسة مدحت السويدي', 'إجابات على أكثر الأسئلة شيوعًا.'),
  ('contact', 'تواصل معنا', 'تواصل معنا — مدرسة مدحت السويدي', 'بيانات التواصل وعناوين الفروع.');

-- Seed homepage sections (empty defaults; code uses fallbacks when title empty)
INSERT INTO public.page_sections (page_slug, section_key, section_type, sort_order, title, subtitle, content, cta_text, cta_url, cta_text_2, cta_url_2) VALUES
  ('home', 'hero', 'hero', 10, 'مدرسة مدحت السويدي للتكنولوجيا التطبيقية', 'أول مدرسة تكنولوجيا تطبيقية متخصصة في الطباعة والتغليف في مصر', 'مناهج معتمدة دوليًا من الغرفة الألمانية AHK Cairo، بالشراكة مع مطبعة السويدي ووزارة التربية والتعليم والتعليم الفني.', 'سجّل زيارة تعريفية', '/visit', 'تعرف على التخصصات', '/programs'),
  ('home', 'why-us', 'generic', 20, 'لماذا مدرسة مدحت السويدي؟', 'تعليم فني بمعايير دولية', '', '', '', '', ''),
  ('home', 'study-system', 'generic', 30, 'نظام الدراسة', 'نظام الساعات المعتمدة والتدريب العملي', '', 'اعرف المزيد', '/study-system', '', ''),
  ('home', 'programs', 'generic', 40, 'التخصصات', 'خمسة تخصصات معتمدة دوليًا', '', 'استكشف التخصصات', '/programs', '', ''),
  ('home', 'student-features', 'generic', 50, 'مميزات الطلاب', 'ما يحصل عليه طلابنا', '', '', '', '', ''),
  ('home', 'career-horizons', 'generic', 60, 'آفاق مهنية محلية وعالمية', 'فرص عمل في مصر والخارج', '', '', '', '', ''),
  ('home', 'education-paths', 'generic', 70, 'المسارات التعليمية بعد التخرج', 'استكمال الدراسة الجامعية والتقنية', '', '', '', '', ''),
  ('home', 'certificates', 'generic', 80, 'الشهادات والاعتمادات', 'اعتماد الغرفة الألمانية AHK Cairo', '', '', '', '', ''),
  ('home', 'video-intro', 'video', 90, 'تعرف على المدرسة عن قرب', 'شاهد جولة داخل المدرسة', '', '', '', '', ''),
  ('home', 'latest-news', 'generic', 100, 'آخر الأخبار', '', '', 'كل الأخبار', '/news', '', ''),
  ('home', 'gallery-preview', 'generic', 110, 'معرض الصور', '', '', 'شاهد المعرض كاملًا', '/gallery', '', ''),
  ('home', 'faq-preview', 'generic', 120, 'الأسئلة الشائعة', '', '', 'كل الأسئلة', '/faq', '', '');
