
-- 1) blog_posts: restrict drafts to admins
DROP POLICY IF EXISTS "Public read blog" ON public.blog_posts;
CREATE POLICY "Public read blog"
ON public.blog_posts
FOR SELECT
TO anon, authenticated
USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

-- 2) bookings: add CHECK constraints + tighten insert policy
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_patient_data_size CHECK (pg_column_size(patient_data) <= 8192),
  ADD CONSTRAINT bookings_agreements_size CHECK (pg_column_size(agreements) <= 4096),
  ADD CONSTRAINT bookings_payment_meta_size CHECK (pg_column_size(payment_meta) <= 4096),
  ADD CONSTRAINT bookings_notes_len CHECK (notes IS NULL OR char_length(notes) <= 2000),
  ADD CONSTRAINT bookings_payment_method_len CHECK (payment_method IS NULL OR char_length(payment_method) <= 64),
  ADD CONSTRAINT bookings_currency_len CHECK (char_length(currency) <= 8),
  ADD CONSTRAINT bookings_status_len CHECK (char_length(status) <= 32),
  ADD CONSTRAINT bookings_concern_name_len CHECK (concern_name IS NULL OR char_length(concern_name) <= 200),
  ADD CONSTRAINT bookings_category_name_len CHECK (category_name IS NULL OR char_length(category_name) <= 200),
  ADD CONSTRAINT bookings_clinician_type_name_len CHECK (clinician_type_name IS NULL OR char_length(clinician_type_name) <= 200),
  ADD CONSTRAINT bookings_amount_cents_range CHECK (amount_cents >= 0 AND amount_cents <= 100000000);

DROP POLICY IF EXISTS "Anyone can submit booking" ON public.bookings;
CREATE POLICY "Anyone can submit booking"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  slot_id IS NOT NULL
  AND patient_data <> '{}'::jsonb
  AND pg_column_size(patient_data) <= 8192
  AND pg_column_size(agreements) <= 4096
  AND pg_column_size(payment_meta) <= 4096
  AND status IN ('confirmed','pending','cancelled')
);

-- 3) Storage: restrict registration-docs uploads
DROP POLICY IF EXISTS "Anyone can upload registration docs" ON storage.objects;
CREATE POLICY "Anyone can upload registration docs"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'registration-docs'
  AND (storage.foldername(name))[1] = 'pending'
  AND lower(coalesce(storage.extension(name), '')) IN ('pdf','png','jpg','jpeg','webp','heic')
  AND coalesce((metadata->>'size')::bigint, 0) <= 10485760
);

-- 4) Storage: remove public listing policy on site-assets (bucket is public; direct URLs still work)
DROP POLICY IF EXISTS "Public view site-assets" ON storage.objects;
