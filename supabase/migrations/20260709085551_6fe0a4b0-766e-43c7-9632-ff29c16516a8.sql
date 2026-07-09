CREATE OR REPLACE FUNCTION public.generate_registration_code()
RETURNS text
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'REG-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
$$;

GRANT EXECUTE ON FUNCTION public.generate_registration_code() TO anon, authenticated;