GRANT INSERT ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
GRANT SELECT, UPDATE ON public.sync_settings TO authenticated;
GRANT ALL ON public.sync_settings TO service_role;