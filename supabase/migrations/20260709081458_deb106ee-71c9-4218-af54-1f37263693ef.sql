
ALTER FUNCTION public.generate_registration_code() SET search_path = public;

DROP POLICY "Anyone can submit a registration" ON public.registrations;

CREATE POLICY "Anyone can submit a registration"
ON public.registrations FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(student_name) BETWEEN 3 AND 120
  AND length(national_id) = 14
  AND length(guardian_phone) BETWEEN 10 AND 15
  AND length(whatsapp) BETWEEN 10 AND 15
  AND length(governorate) > 0
  AND length(edu_dept) BETWEEN 2 AND 120
  AND attendees BETWEEN 1 AND 3
  AND status = 'جديد'
  AND sync_status = 'pending'
);

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.generate_registration_code() FROM public;
REVOKE EXECUTE ON FUNCTION public.generate_registration_code() FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM public;
