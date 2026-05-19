
-- Categories
CREATE TABLE public.medicare_service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'Stethoscope',
  banner_image TEXT,
  color TEXT,
  search_keywords TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE public.medicare_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.medicare_service_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  description TEXT,
  icon TEXT DEFAULT 'Stethoscope',
  hero_image TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  search_keywords TEXT,
  price_amount NUMERIC(10,2),
  price_currency TEXT DEFAULT 'GBP',
  price_label TEXT,
  duration_minutes INTEGER,
  recommended_clinicians JSONB NOT NULL DEFAULT '[]'::jsonb,
  whats_included JSONB NOT NULL DEFAULT '[]'::jsonb,
  preparation TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cta_label TEXT,
  cta_href TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medicare_services_category ON public.medicare_services(category_id);
CREATE INDEX idx_medicare_services_visible ON public.medicare_services(visible);

-- FAQs (optional service_id; null = page-level)
CREATE TABLE public.medicare_service_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.medicare_services(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Page singleton
CREATE TABLE public.medicare_services_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  hero_eyebrow TEXT DEFAULT 'Our Services',
  hero_title TEXT DEFAULT 'Healthcare designed around you',
  hero_description TEXT DEFAULT 'Discover our full range of medical services — from everyday GP care to specialist consultations, all delivered with warmth and precision.',
  hero_image TEXT,
  intro_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_badge TEXT DEFAULT 'Ready when you are',
  cta_title TEXT DEFAULT 'Book your consultation today',
  cta_description TEXT DEFAULT 'Speak to a certified doctor in minutes. Same-day appointments available.',
  cta_primary_label TEXT DEFAULT 'Book Appointment',
  cta_primary_href TEXT DEFAULT '#cta',
  cta_secondary_label TEXT DEFAULT 'Talk to Us',
  cta_secondary_href TEXT DEFAULT '#contact',
  cta_image TEXT,
  seo_title TEXT DEFAULT 'Services — MediCare',
  seo_description TEXT DEFAULT 'Explore the full range of MediCare services.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed page singleton
INSERT INTO public.medicare_services_page (singleton) VALUES (true);

-- updated_at triggers
CREATE TRIGGER trg_msc_updated BEFORE UPDATE ON public.medicare_service_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ms_updated BEFORE UPDATE ON public.medicare_services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_msf_updated BEFORE UPDATE ON public.medicare_service_faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_msp_updated BEFORE UPDATE ON public.medicare_services_page FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.medicare_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicare_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicare_service_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicare_services_page ENABLE ROW LEVEL SECURITY;

-- Public policies (match adverts/medicare admin pattern)
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['medicare_service_categories','medicare_services','medicare_service_faqs','medicare_services_page']) LOOP
    EXECUTE format('CREATE POLICY "Public read %1$s" ON public.%1$s FOR SELECT USING (true)', t);
    EXECUTE format('CREATE POLICY "Public insert %1$s" ON public.%1$s FOR INSERT WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Public update %1$s" ON public.%1$s FOR UPDATE USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Public delete %1$s" ON public.%1$s FOR DELETE USING (true)', t);
  END LOOP;
END $$;

-- Seed sample categories + services
INSERT INTO public.medicare_service_categories (name, slug, description, icon, sort_order) VALUES
  ('General Practice', 'general-practice', 'Everyday primary care and check-ups.', 'Stethoscope', 0),
  ('Specialist Consultations', 'specialist', 'Access leading specialists across multiple disciplines.', 'HeartPulse', 1),
  ('Diagnostics & Screening', 'diagnostics', 'Comprehensive health checks and laboratory tests.', 'FlaskConical', 2),
  ('Mental Health & Wellbeing', 'mental-health', 'Therapy and emotional support from accredited clinicians.', 'Brain', 3),
  ('Women''s Health', 'womens-health', 'Dedicated care for every stage of a woman''s life.', 'Heart', 4),
  ('Travel & Vaccinations', 'travel', 'Pre-travel consultations and vaccination programmes.', 'Syringe', 5);

INSERT INTO public.medicare_services (category_id, title, slug, summary, description, icon, tags, price_amount, price_currency, price_label, duration_minutes, recommended_clinicians, whats_included, featured, sort_order)
SELECT id, 'GP Consultation', 'gp-consultation', 'Same-day appointments with experienced general practitioners.', 'Comprehensive in-person or video consultations covering everyday illnesses, minor injuries, prescriptions and referrals.', 'Stethoscope', '["Same-day","In-person","Video"]'::jsonb, 95, 'GBP', 'From £95', 20, '["GP","Family Doctor"]'::jsonb, '["Full medical assessment","Prescription if needed","Referral letters","Follow-up notes"]'::jsonb, true, 0 FROM public.medicare_service_categories WHERE slug = 'general-practice';

INSERT INTO public.medicare_services (category_id, title, slug, summary, description, icon, tags, price_amount, price_currency, price_label, duration_minutes, recommended_clinicians, whats_included, sort_order)
SELECT id, 'Health Screening', 'health-screening', 'Comprehensive head-to-toe screening tailored to your age and lifestyle.', 'A full-body screening including bloods, ECG, and a detailed report with lifestyle recommendations.', 'Activity', '["Preventive","Bloods","ECG"]'::jsonb, 450, 'GBP', 'From £450', 90, '["GP","Cardiologist"]'::jsonb, '["Blood panel","ECG","Body composition","Doctor consultation","Written report"]'::jsonb, 1 FROM public.medicare_service_categories WHERE slug = 'diagnostics';

INSERT INTO public.medicare_services (category_id, title, slug, summary, description, icon, tags, price_amount, price_currency, price_label, duration_minutes, recommended_clinicians, whats_included, featured, sort_order)
SELECT id, 'Mental Health Therapy', 'mental-health-therapy', 'Confidential therapy sessions with accredited psychologists.', '50-minute online or in-person sessions covering anxiety, depression, stress, relationships and more.', 'Brain', '["Confidential","Online","CBT"]'::jsonb, 120, 'GBP', 'From £120', 50, '["Psychologist","Therapist"]'::jsonb, '["50-minute session","Personalised plan","Secure video room","Follow-up resources"]'::jsonb, true, 2 FROM public.medicare_service_categories WHERE slug = 'mental-health';

INSERT INTO public.medicare_services (category_id, title, slug, summary, description, icon, tags, price_amount, price_currency, price_label, duration_minutes, recommended_clinicians, whats_included, sort_order)
SELECT id, 'Cardiology Consultation', 'cardiology', 'Specialist heart assessments with senior cardiologists.', 'Detailed cardiac assessment including ECG and risk stratification.', 'HeartPulse', '["Specialist","Heart","ECG"]'::jsonb, 280, 'GBP', 'From £280', 45, '["Cardiologist"]'::jsonb, '["Specialist consultation","Resting ECG","Risk assessment","Personalised plan"]'::jsonb, 3 FROM public.medicare_service_categories WHERE slug = 'specialist';

INSERT INTO public.medicare_services (category_id, title, slug, summary, description, icon, tags, price_amount, price_currency, price_label, duration_minutes, recommended_clinicians, whats_included, sort_order)
SELECT id, 'Women''s Wellness Check', 'womens-wellness', 'Comprehensive wellness check designed for women.', 'A dedicated appointment covering reproductive health, hormones, breast and cervical screening.', 'Heart', '["Wellness","Screening"]'::jsonb, 220, 'GBP', 'From £220', 60, '["GP","Gynaecologist"]'::jsonb, '["Full consultation","Hormone bloods","Cervical screening (opt)","Lifestyle plan"]'::jsonb, 4 FROM public.medicare_service_categories WHERE slug = 'womens-health';

INSERT INTO public.medicare_services (category_id, title, slug, summary, description, icon, tags, price_amount, price_currency, price_label, duration_minutes, recommended_clinicians, whats_included, sort_order)
SELECT id, 'Travel Clinic', 'travel-clinic', 'Pre-travel consultations and vaccinations for any destination.', 'Personalised travel health advice with vaccinations and antimalarial prescriptions where appropriate.', 'Syringe', '["Vaccines","Travel","Same-day"]'::jsonb, 75, 'GBP', 'From £75', 25, '["Travel Nurse","GP"]'::jsonb, '["Destination risk review","Vaccines available","Antimalarials","Travel certificate"]'::jsonb, 5 FROM public.medicare_service_categories WHERE slug = 'travel';

-- Page-level FAQs
INSERT INTO public.medicare_service_faqs (service_id, question, answer, sort_order) VALUES
  (NULL, 'How quickly can I be seen?', 'Most appointments are available same day or next day, both in-person and via video.', 0),
  (NULL, 'Do you accept private medical insurance?', 'Yes — we are recognised by all major private health insurers. Please check with your provider before booking.', 1),
  (NULL, 'Can I be referred to a specialist?', 'Yes. Our GPs can refer you to any of our in-house specialists or to external consultants of your choice.', 2),
  (NULL, 'Are consultations confidential?', 'All consultations are strictly confidential and your medical records are encrypted at rest and in transit.', 3);
