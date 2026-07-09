DROP POLICY IF EXISTS "Anyone can submit a registration" ON public.registrations;
CREATE POLICY "Anyone can submit a registration"
  ON public.registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(student_name) >= 3 AND length(student_name) <= 120
    AND length(national_id) = 14
    AND length(guardian_phone) BETWEEN 10 AND 15
    AND length(whatsapp) BETWEEN 10 AND 15
    AND length(governorate) > 0
    AND length(edu_dept) >= 2 AND length(edu_dept) <= 120
    AND attendees BETWEEN 1 AND 3
    AND status = 'جديد'
    AND sync_status = 'pending'
  );