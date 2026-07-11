ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS youtube_intro_title text NOT NULL DEFAULT 'تعرف على المدرسة عن قرب',
  ADD COLUMN IF NOT EXISTS youtube_intro_description text NOT NULL DEFAULT 'شاهد نبذة عن مدرسة مدحت السويدي للتكنولوجيا التطبيقية، ونظام الدراسة، والتدريب العملي، والفرص التي يحصل عليها الطلاب داخل بيئة تعليمية وصناعية متخصصة.',
  ADD COLUMN IF NOT EXISTS youtube_intro_enabled boolean NOT NULL DEFAULT true;