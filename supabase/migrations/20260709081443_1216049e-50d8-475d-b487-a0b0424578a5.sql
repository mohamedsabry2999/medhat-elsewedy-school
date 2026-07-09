
-- Admin email allowed
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '') = 'mohamedsabryabdelfatah@gmail.com'
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Registration code generator: REG-YYYYMMDD-XXXXXX
CREATE OR REPLACE FUNCTION public.generate_registration_code()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT 'REG-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
$$;

-- Registrations table
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_code text NOT NULL UNIQUE DEFAULT public.generate_registration_code(),
  student_name text NOT NULL,
  national_id text NOT NULL,
  guardian_phone text NOT NULL,
  whatsapp text NOT NULL,
  governorate text NOT NULL,
  edu_dept text NOT NULL,
  score text NOT NULL,
  attendees int NOT NULL DEFAULT 1,
  visit_day text NOT NULL,
  time_slot text NOT NULL,
  visit_date date NOT NULL,
  visit_location text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'جديد',
  source text NOT NULL DEFAULT 'website',
  sync_status text NOT NULL DEFAULT 'pending',
  sync_error text,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;
GRANT INSERT ON public.registrations TO anon;
GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Public can insert their own registration (form submission); no reads for anon
CREATE POLICY "Anyone can submit a registration"
ON public.registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admin can read
CREATE POLICY "Admin can view all registrations"
ON public.registrations FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only admin can update
CREATE POLICY "Admin can update registrations"
ON public.registrations FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TRIGGER trg_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_registrations_created_at ON public.registrations (created_at DESC);
CREATE INDEX idx_registrations_sync_status ON public.registrations (sync_status);

-- Sync settings (single row)
CREATE TABLE public.sync_settings (
  id int PRIMARY KEY DEFAULT 1,
  sheet_id text NOT NULL DEFAULT '',
  webhook_url text NOT NULL DEFAULT '',
  tab_name text NOT NULL DEFAULT 'Registrations',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sync_settings_single_row CHECK (id = 1)
);

INSERT INTO public.sync_settings (id) VALUES (1);

GRANT SELECT, UPDATE ON public.sync_settings TO authenticated;
GRANT ALL ON public.sync_settings TO service_role;

ALTER TABLE public.sync_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read sync settings"
ON public.sync_settings FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin can update sync settings"
ON public.sync_settings FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TRIGGER trg_sync_settings_updated_at
BEFORE UPDATE ON public.sync_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime for admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
