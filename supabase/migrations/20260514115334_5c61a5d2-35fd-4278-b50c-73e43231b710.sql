
-- ============ CONCERN CATEGORIES ============
CREATE TABLE public.booking_concern_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'Stethoscope',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_concern_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read concern categories" ON public.booking_concern_categories FOR SELECT USING (true);
CREATE POLICY "Admins write concern categories" ON public.booking_concern_categories FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bcc_updated BEFORE UPDATE ON public.booking_concern_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CONCERNS ============
CREATE TABLE public.booking_concerns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.booking_concern_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  tags text[] NOT NULL DEFAULT '{}',
  severity text DEFAULT 'routine',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_concerns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read concerns" ON public.booking_concerns FOR SELECT USING (true);
CREATE POLICY "Admins write concerns" ON public.booking_concerns FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bc_updated BEFORE UPDATE ON public.booking_concerns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CLINICIAN TYPES ============
CREATE TABLE public.booking_clinician_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  treats text,
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  wait_time_minutes int NOT NULL DEFAULT 15,
  duration_minutes int NOT NULL DEFAULT 20,
  badge text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_clinician_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read clinician types" ON public.booking_clinician_types FOR SELECT USING (true);
CREATE POLICY "Admins write clinician types" ON public.booking_clinician_types FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bct_updated BEFORE UPDATE ON public.booking_clinician_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CONCERN -> CLINICIAN MAP ============
CREATE TABLE public.booking_concern_clinician_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concern_id uuid NOT NULL REFERENCES public.booking_concerns(id) ON DELETE CASCADE,
  clinician_type_id uuid NOT NULL REFERENCES public.booking_clinician_types(id) ON DELETE CASCADE,
  priority int NOT NULL DEFAULT 0,
  recommended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (concern_id, clinician_type_id)
);
ALTER TABLE public.booking_concern_clinician_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read map" ON public.booking_concern_clinician_map FOR SELECT USING (true);
CREATE POLICY "Admins write map" ON public.booking_concern_clinician_map FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- ============ TIME SLOTS ============
CREATE TABLE public.booking_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_type_id uuid REFERENCES public.booking_clinician_types(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  capacity int NOT NULL DEFAULT 1,
  booked_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read slots" ON public.booking_time_slots FOR SELECT USING (true);
CREATE POLICY "Public increment slots" ON public.booking_time_slots FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins write slots" ON public.booking_time_slots FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bts_updated BEFORE UPDATE ON public.booking_time_slots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_bts_date ON public.booking_time_slots(slot_date);

-- ============ INTAKE FIELDS ============
CREATE TABLE public.booking_intake_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key text NOT NULL UNIQUE,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text',
  placeholder text,
  options jsonb DEFAULT '[]'::jsonb,
  required boolean NOT NULL DEFAULT true,
  visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_intake_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read intake fields" ON public.booking_intake_fields FOR SELECT USING (true);
CREATE POLICY "Admins write intake fields" ON public.booking_intake_fields FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bif_updated BEFORE UPDATE ON public.booking_intake_fields FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ LEGAL AGREEMENTS ============
CREATE TABLE public.booking_legal_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  required boolean NOT NULL DEFAULT true,
  agreement_type text NOT NULL DEFAULT 'consent',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_legal_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read legal" ON public.booking_legal_agreements FOR SELECT USING (true);
CREATE POLICY "Admins write legal" ON public.booking_legal_agreements FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bla_updated BEFORE UPDATE ON public.booking_legal_agreements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PAYMENT METHODS ============
CREATE TABLE public.booking_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  icon text DEFAULT 'CreditCard',
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read payment methods" ON public.booking_payment_methods FOR SELECT USING (true);
CREATE POLICY "Admins write payment methods" ON public.booking_payment_methods FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bpm_updated BEFORE UPDATE ON public.booking_payment_methods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ HMO PROVIDERS ============
CREATE TABLE public.booking_hmo_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_hmo_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hmo" ON public.booking_hmo_providers FOR SELECT USING (true);
CREATE POLICY "Admins write hmo" ON public.booking_hmo_providers FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bhp_updated BEFORE UPDATE ON public.booking_hmo_providers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SUBSCRIPTION PLANS ============
CREATE TABLE public.booking_subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  billing_period text NOT NULL DEFAULT 'monthly',
  perks jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read plans" ON public.booking_subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admins write plans" ON public.booking_subscription_plans FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bsp_updated BEFORE UPDATE ON public.booking_subscription_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SETTINGS (singleton) ============
CREATE TABLE public.booking_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  currency text NOT NULL DEFAULT 'NGN',
  currency_symbol text NOT NULL DEFAULT '₦',
  emergency_warning text NOT NULL DEFAULT 'If you are experiencing a medical emergency, please call 112 or go to the nearest emergency room immediately. This service is not for emergency care.',
  booking_notice text NOT NULL DEFAULT 'All consultations are confidential and conducted by certified clinicians.',
  confirmation_message text NOT NULL DEFAULT 'Your appointment is confirmed. A confirmation email has been sent to you with your consultation link and details.',
  tax_percent numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read booking settings" ON public.booking_settings FOR SELECT USING (true);
CREATE POLICY "Admins write booking settings" ON public.booking_settings FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bs_updated BEFORE UPDATE ON public.booking_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('BK-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  concern_id uuid REFERENCES public.booking_concerns(id) ON DELETE SET NULL,
  concern_name text,
  category_name text,
  clinician_type_id uuid REFERENCES public.booking_clinician_types(id) ON DELETE SET NULL,
  clinician_type_name text,
  slot_id uuid REFERENCES public.booking_time_slots(id) ON DELETE SET NULL,
  slot_date date,
  slot_time time,
  patient_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  agreements jsonb NOT NULL DEFAULT '[]'::jsonb,
  payment_method text,
  payment_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  amount_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'confirmed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bk_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_bookings_created ON public.bookings(created_at DESC);
