
-- =========================
-- adverts
-- =========================
DROP POLICY IF EXISTS "Public insert adverts" ON public.adverts;
DROP POLICY IF EXISTS "Public update adverts" ON public.adverts;
DROP POLICY IF EXISTS "Public delete adverts" ON public.adverts;
CREATE POLICY "Admins write adverts" ON public.adverts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =========================
-- blog_posts
-- =========================
DROP POLICY IF EXISTS "Public insert blog" ON public.blog_posts;
DROP POLICY IF EXISTS "Public update blog" ON public.blog_posts;
DROP POLICY IF EXISTS "Public delete blog" ON public.blog_posts;
CREATE POLICY "Admins write blog" ON public.blog_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =========================
-- medicare_services + related
-- =========================
DROP POLICY IF EXISTS "Public insert medicare_services" ON public.medicare_services;
DROP POLICY IF EXISTS "Public update medicare_services" ON public.medicare_services;
DROP POLICY IF EXISTS "Public delete medicare_services" ON public.medicare_services;
CREATE POLICY "Admins write medicare_services" ON public.medicare_services FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Public insert medicare_service_categories" ON public.medicare_service_categories;
DROP POLICY IF EXISTS "Public update medicare_service_categories" ON public.medicare_service_categories;
DROP POLICY IF EXISTS "Public delete medicare_service_categories" ON public.medicare_service_categories;
CREATE POLICY "Admins write medicare_service_categories" ON public.medicare_service_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Public insert medicare_service_faqs" ON public.medicare_service_faqs;
DROP POLICY IF EXISTS "Public update medicare_service_faqs" ON public.medicare_service_faqs;
DROP POLICY IF EXISTS "Public delete medicare_service_faqs" ON public.medicare_service_faqs;
CREATE POLICY "Admins write medicare_service_faqs" ON public.medicare_service_faqs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Public insert medicare_services_page" ON public.medicare_services_page;
DROP POLICY IF EXISTS "Public update medicare_services_page" ON public.medicare_services_page;
DROP POLICY IF EXISTS "Public delete medicare_services_page" ON public.medicare_services_page;
CREATE POLICY "Admins write medicare_services_page" ON public.medicare_services_page FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =========================
-- contact_messages
-- =========================
DROP POLICY IF EXISTS "Public read contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Public update contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Public delete contact" ON public.contact_messages;
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update contact" ON public.contact_messages FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete contact" ON public.contact_messages FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =========================
-- registrations
-- =========================
DROP POLICY IF EXISTS "Public view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Public update registrations" ON public.registrations;
CREATE POLICY "Admins read registrations" ON public.registrations FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update registrations" ON public.registrations FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =========================
-- profiles
-- =========================
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;

-- =========================
-- booking_time_slots: remove public UPDATE, expose RPC
-- =========================
DROP POLICY IF EXISTS "Public increment slots" ON public.booking_time_slots;

CREATE OR REPLACE FUNCTION public.increment_booking_slot(_slot_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.booking_time_slots
     SET booked_count = booked_count + 1
   WHERE id = _slot_id
     AND booked_count < capacity;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_booking_slot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_booking_slot(uuid) TO anon, authenticated;

-- =========================
-- registration-docs bucket: private + admin read only
-- =========================
UPDATE storage.buckets SET public = false WHERE id = 'registration-docs';
DROP POLICY IF EXISTS "Public read registration docs" ON storage.objects;
CREATE POLICY "Admins read registration docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'registration-docs' AND has_role(auth.uid(), 'admin'::app_role));

-- =========================
-- Revoke EXECUTE on internal helpers from anon/authenticated
-- =========================
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, PUBLIC;
