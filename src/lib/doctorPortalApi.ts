import { api, type PaginationMeta } from "@/lib/api";

type AnyRecord = Record<string, any>;

export type DoctorPortalProfile = {
  name: string;
  title: string;
  specialty: string;
  license: string;
};

export type DoctorPortalAppointment = {
  id: string;
  appointmentUuid: string;
  consultationUuid?: string;
  patientUuid?: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  age?: number;
  gender?: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  mode?: string;
  raw: AnyRecord;
};

export type DoctorPortalPatient = {
  id: string;
  uuid: string;
  name: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  lastVisit?: string;
  condition?: string;
  prescriptions: AnyRecord[];
  clinicalNotes: AnyRecord[];
  raw: AnyRecord;
};

export type DoctorPortalDashboard = {
  profile: DoctorPortalProfile;
  stats: {
    todayAppointments: number;
    weekConsultations: number;
    activePatients: number;
    pendingNotes: number;
  };
  todaySchedule: DoctorPortalAppointment[];
};

export type DoctorPortalSettings = {
  fullName: string;
  title: string;
  specialty: string;
  license: string;
  yearsExperience: string;
  hospital: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  languages: string;
  consultationFee: string;
  preferences: {
    emailNotif: boolean;
    smsNotif: boolean;
    autoAccept: boolean;
  };
  raw: AnyRecord;
};

export type DoctorPortalPaymentOverview = {
  totalEarnings: number;
  platformCommission: number;
  netEarnings: number;
  referralCommission: number;
  totalReferrals: number;
  pendingAmount: number;
  availableBalance: number;
  nextPayout: string;
};

export type DoctorPortalEarning = {
  id: string;
  type: string;
  patient: string;
  amount: number;
  date: string;
  status?: string;
  raw: AnyRecord;
};

export type DoctorPortalPayout = {
  id: string;
  reference: string;
  amount: number;
  date: string;
  method?: string;
  raw: AnyRecord;
};

export type DoctorPortalReferralEarning = {
  id: string;
  doctor: string;
  patient: string;
  amount: number;
  date: string;
  status?: string;
  raw: AnyRecord;
};

export type DoctorPortalList<T> = {
  items: T[];
  meta?: PaginationMeta;
};

const COMMON_LIST_KEYS = [
  "data",
  "items",
  "records",
  "results",
  "appointments",
  "schedule",
  "patients",
  "earnings",
  "transactions",
  "payouts",
  "referrals",
  "investigations",
  "clinical_notes",
];

const asRecord = (value: unknown): AnyRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? value as AnyRecord : {};

const unwrapData = (value: unknown): unknown => {
  const record = asRecord(value);
  return Object.prototype.hasOwnProperty.call(record, "data") ? record.data : value;
};

const pickString = (record: AnyRecord, keys: string[], fallback = "") => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
};

const pickNumber = (record: AnyRecord, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
};

const moneyFromKobo = (record: AnyRecord, koboKeys: string[], amountKeys: string[], fallback = 0) => {
  for (const key of koboKeys) {
    const value = pickNumber(record, [key], Number.NaN);
    if (Number.isFinite(value)) return value / 100;
  }
  return pickNumber(record, amountKeys, fallback);
};

const fullName = (record: AnyRecord, fallback = "") =>
  [record.first_name, record.middle_name, record.last_name].filter(Boolean).join(" ").trim() ||
  pickString(record, ["full_name", "name", "display_name", "doctor_name", "patient_name"], fallback);

const formatDate = (value: unknown, fallback = "") => {
  if (!value) return fallback;
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toISOString().slice(0, 10);
};

const formatTime = (value: unknown, fallback = "") => {
  if (!value) return fallback;
  const text = String(value);
  if (/^\d{1,2}:\d{2}/.test(text)) return text.slice(0, 5);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const calculateAge = (dob?: string) => {
  if (!dob) return undefined;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < date.getDate())) age -= 1;
  return age;
};

const extractItems = (value: unknown, preferredKeys: string[] = []) => {
  const queue = [value, unwrapData(value)];
  const seen = new Set<unknown>();
  const keys = [...preferredKeys, ...COMMON_LIST_KEYS];

  while (queue.length) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) return current;

    const record = asRecord(current);
    for (const key of keys) {
      if (record[key] !== undefined) queue.push(record[key]);
    }
  }

  return [];
};

const extractMeta = (value: unknown): PaginationMeta | undefined => {
  const root = asRecord(value);
  const data = asRecord(root.data);
  return root.meta ?? data.meta;
};

export const normalizeAppointment = (value: unknown): DoctorPortalAppointment => {
  const record = asRecord(value);
  const patient = asRecord(record.patient ?? record.patient_user ?? record.patient_profile ?? record.user);
  const start = pickString(record, ["starts_at", "start_at", "scheduled_at", "appointment_datetime", "date_time"]);
  const appointmentUuid = pickString(record, ["appointment_uuid", "uuid", "id"], crypto.randomUUID());
  const consultationUuid = pickString(record, ["consultation_uuid", "consultation_id"]);
  const patientName = fullName(patient, pickString(record, ["patient_name", "patient"]));

  return {
    id: appointmentUuid,
    appointmentUuid,
    consultationUuid: consultationUuid || undefined,
    patientUuid: pickString(patient, ["uuid", "id"]) || pickString(record, ["patient_user_uuid", "patient_uuid"]) || undefined,
    patientName: patientName || "Patient",
    patientEmail: pickString(patient, ["email"]) || pickString(record, ["patient_email"]) || undefined,
    patientPhone: pickString(patient, ["phone", "phone_number"]) || pickString(record, ["patient_phone"]) || undefined,
    age: pickNumber(patient, ["age"], calculateAge(pickString(patient, ["dob", "date_of_birth"])) ?? 0) || undefined,
    gender: pickString(patient, ["gender", "sex"]) || pickString(record, ["gender"]) || undefined,
    date: pickString(record, ["appointment_date", "slot_date", "date"]) || formatDate(start, new Date().toISOString().slice(0, 10)),
    time: pickString(record, ["slot_start_time", "start_time", "time"]) || formatTime(start, ""),
    reason: pickString(record, ["reason_for_visit", "reason", "complaint", "notes"], "Consultation"),
    status: pickString(record, ["status"], "scheduled").replace(/-/g, "_"),
    mode: pickString(record, ["mode", "appointment_type", "type"]) || undefined,
    raw: record,
  };
};

export const normalizePatient = (value: unknown): DoctorPortalPatient => {
  const record = asRecord(value);
  const profile = asRecord(record.patient ?? record.profile ?? record.user ?? record);
  const uuid = pickString(profile, ["uuid", "id"]) || pickString(record, ["patient_user_uuid", "uuid", "id"], crypto.randomUUID());
  const prescriptions = extractItems(record.prescriptions ?? record.prescription_documents, ["prescriptions"]);
  const clinicalNotes = extractItems(record.clinical_notes ?? record.consultations ?? record.notes, ["clinical_notes", "consultations"]);

  return {
    id: uuid,
    uuid,
    name: fullName(profile, pickString(record, ["patient_name", "name"], "Patient")),
    email: pickString(profile, ["email"]) || undefined,
    phone: pickString(profile, ["phone", "phone_number"]) || undefined,
    age: pickNumber(profile, ["age"], calculateAge(pickString(profile, ["dob", "date_of_birth"])) ?? 0) || undefined,
    gender: pickString(profile, ["gender", "sex"]) || undefined,
    lastVisit: formatDate(pickString(record, ["last_visit", "last_visit_at", "last_appointment_date", "updated_at"]), ""),
    condition: pickString(record, ["condition", "diagnosis", "primary_condition"], ""),
    prescriptions: prescriptions.map(asRecord),
    clinicalNotes: clinicalNotes.map(asRecord),
    raw: record,
  };
};

export const normalizeDashboard = (value: unknown, fallbackName = "Doctor"): DoctorPortalDashboard => {
  const data = asRecord(unwrapData(value));
  const profileSource = asRecord(data.profile ?? data.doctor ?? data.user ?? data);
  const statsSource = asRecord(data.stats ?? data.summary ?? data.counts ?? data);
  const schedule = extractItems(data.today_schedule ?? data.todaySchedule ?? data.appointments ?? data.schedule ?? data, [
    "today_schedule",
    "todaySchedule",
    "appointments",
    "schedule",
  ]).map(normalizeAppointment);

  return {
    profile: {
      name: fullName(profileSource, fallbackName),
      title: pickString(profileSource, ["title", "designation"], "Doctor"),
      specialty: pickString(profileSource, ["specialty", "specialisation", "specialization"], "Medical Practitioner"),
      license: pickString(profileSource, ["medical_license_no", "license", "license_no", "mdcn_number"], "N/A"),
    },
    stats: {
      todayAppointments: pickNumber(statsSource, ["today_appointments", "todayAppointments", "appointments_today"], schedule.length),
      weekConsultations: pickNumber(statsSource, ["week_consultations", "weekConsultations", "consultations_this_week"], 0),
      activePatients: pickNumber(statsSource, ["active_patients", "activePatients", "total_patients", "patients"], 0),
      pendingNotes: pickNumber(statsSource, ["pending_notes", "pendingNotes", "unsigned_notes"], 0),
    },
    todaySchedule: schedule,
  };
};

export const normalizeSettings = (value: unknown): DoctorPortalSettings => {
  const data = asRecord(unwrapData(value));
  const preferences = asRecord(data.preferences);

  return {
    fullName: fullName(data),
    title: pickString(data, ["title"]),
    specialty: pickString(data, ["specialty", "specialisation", "specialization"]),
    license: pickString(data, ["medical_license_no", "license", "license_no", "mdcn_number"]),
    yearsExperience: pickString(data, ["years_experience", "yearsExperience"]),
    hospital: pickString(data, ["hospital_clinic", "hospital", "clinic"]),
    email: pickString(data, ["contact_email", "email"]),
    phone: pickString(data, ["contact_phone", "phone"]),
    address: pickString(data, ["contact_address", "address"]),
    bio: pickString(data, ["professional_bio", "bio"]),
    languages: Array.isArray(data.languages) ? data.languages.join(", ") : pickString(data, ["languages"]),
    consultationFee: pickString(data, ["consultation_fee", "consultationFee"]),
    preferences: {
      emailNotif: preferences.email_new_appointments !== false,
      smsNotif: preferences.sms_urgent_updates === true,
      autoAccept: preferences.auto_accept_existing === true,
    },
    raw: data,
  };
};

export const settingsToApiPayload = (
  profile: Omit<DoctorPortalSettings, "preferences" | "raw">,
  preferences: DoctorPortalSettings["preferences"],
) => ({
  title: profile.title,
  medical_license_no: profile.license,
  years_experience: Number(profile.yearsExperience) || undefined,
  hospital_clinic: profile.hospital,
  consultation_fee: Number(profile.consultationFee) || undefined,
  languages: profile.languages,
  professional_bio: profile.bio,
  contact_email: profile.email,
  contact_phone: profile.phone,
  contact_address: profile.address,
  preferences: {
    email_new_appointments: preferences.emailNotif,
    sms_urgent_updates: preferences.smsNotif,
    auto_accept_existing: preferences.autoAccept,
  },
});

export const normalizePaymentOverview = (value: unknown): DoctorPortalPaymentOverview => {
  const data = asRecord(unwrapData(value));
  return {
    totalEarnings: moneyFromKobo(data, ["total_earnings_kobo"], ["total_earnings", "totalEarnings"]),
    platformCommission: moneyFromKobo(data, ["platform_commission_kobo"], ["platform_commission", "platformCommission"]),
    netEarnings: moneyFromKobo(data, ["net_earnings_kobo"], ["net_earnings", "netEarnings"]),
    referralCommission: moneyFromKobo(data, ["referral_commission_kobo"], ["referral_commission", "referralCommission"]),
    totalReferrals: pickNumber(data, ["total_referrals", "totalReferrals", "referrals_count"], 0),
    pendingAmount: moneyFromKobo(data, ["pending_amount_kobo"], ["pending_amount", "pendingAmount"]),
    availableBalance: moneyFromKobo(data, ["available_balance_kobo"], ["available_balance", "availableBalance"]),
    nextPayout: formatDate(pickString(data, ["next_payout", "next_payout_date", "nextPayout"]), ""),
  };
};

export const normalizeEarning = (value: unknown): DoctorPortalEarning => {
  const record = asRecord(value);
  const patient = asRecord(record.patient ?? record.patient_user);
  return {
    id: pickString(record, ["uuid", "id", "reference"], crypto.randomUUID()),
    type: pickString(record, ["type", "earning_type", "source"], "Consultation"),
    patient: fullName(patient, pickString(record, ["patient_name", "patient"], "Patient")),
    amount: moneyFromKobo(record, ["amount_kobo", "net_amount_kobo"], ["amount", "net_amount"]),
    date: formatDate(pickString(record, ["earned_on", "date", "created_at"]), ""),
    status: pickString(record, ["status"]) || undefined,
    raw: record,
  };
};

export const normalizePayout = (value: unknown): DoctorPortalPayout => {
  const record = asRecord(value);
  return {
    id: pickString(record, ["uuid", "id", "reference"], crypto.randomUUID()),
    reference: pickString(record, ["reference", "payment_reference", "uuid", "id"], "Payout"),
    amount: moneyFromKobo(record, ["amount_kobo"], ["amount"]),
    date: formatDate(pickString(record, ["paid_on", "date", "created_at"]), ""),
    method: pickString(record, ["method", "payment_method"]) || undefined,
    raw: record,
  };
};

export const normalizeReferralEarning = (value: unknown): DoctorPortalReferralEarning => {
  const record = asRecord(value);
  const doctor = asRecord(record.doctor ?? record.referred_doctor);
  const patient = asRecord(record.patient ?? record.patient_user);
  return {
    id: pickString(record, ["uuid", "id", "reference"], crypto.randomUUID()),
    doctor: fullName(doctor, pickString(record, ["doctor_name", "specialist_name", "referred_doctor_name"], "Referred doctor")),
    patient: fullName(patient, pickString(record, ["patient_name", "patient"], "Patient")),
    amount: moneyFromKobo(record, ["commission_kobo", "amount_kobo"], ["commission", "amount"]),
    date: formatDate(pickString(record, ["referred_on", "date", "created_at"]), ""),
    status: pickString(record, ["status"]) || undefined,
    raw: record,
  };
};

export const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const doctorPortalApi = {
  dashboard: async (fallbackName?: string) =>
    normalizeDashboard(await api.doctorPortal.dashboard(), fallbackName),

  schedule: async (weekOf?: string): Promise<DoctorPortalList<DoctorPortalAppointment>> => {
    const response = await api.doctorPortal.schedule(weekOf ? { week_of: weekOf } : undefined);
    return {
      items: extractItems(response, ["schedule", "appointments"]).map(normalizeAppointment),
      meta: extractMeta(response),
    };
  },

  appointments: async (query?: { status?: string; page?: number; per_page?: number }): Promise<DoctorPortalList<DoctorPortalAppointment>> => {
    const response = await api.doctorPortal.appointments.list(query);
    return {
      items: extractItems(response, ["appointments"]).map(normalizeAppointment),
      meta: extractMeta(response),
    };
  },

  appointmentDetail: async (appointmentUuid: string) =>
    normalizeAppointment(unwrapData(await api.doctorPortal.appointments.detail(appointmentUuid))),

  patients: async (query?: { search?: string; page?: number; per_page?: number }): Promise<DoctorPortalList<DoctorPortalPatient>> => {
    const response = await api.doctorPortal.patients.list(query);
    return {
      items: extractItems(response, ["patients"]).map(normalizePatient),
      meta: extractMeta(response),
    };
  },

  patientDetail: async (patientUserUuid: string) =>
    normalizePatient(unwrapData(await api.doctorPortal.patients.detail(patientUserUuid))),

  settings: async () => normalizeSettings(await api.doctorPortal.settings.get()),

  updateSettings: async (
    profile: Omit<DoctorPortalSettings, "preferences" | "raw">,
    preferences: DoctorPortalSettings["preferences"],
  ) => api.doctorPortal.settings.update(settingsToApiPayload(profile, preferences)),

  payments: {
    overview: async () => normalizePaymentOverview(await api.doctorPortal.payments.overview()),
    earnings: async (query?: { type?: string; from?: string; to?: string; page?: number; per_page?: number }): Promise<DoctorPortalList<DoctorPortalEarning>> => {
      const response = await api.doctorPortal.payments.earnings(query);
      return {
        items: extractItems(response, ["earnings", "transactions"]).map(normalizeEarning),
        meta: extractMeta(response),
      };
    },
    referrals: async (query?: { page?: number; per_page?: number }): Promise<DoctorPortalList<DoctorPortalReferralEarning>> => {
      const response = await api.doctorPortal.payments.referrals(query);
      return {
        items: extractItems(response, ["referrals"]).map(normalizeReferralEarning),
        meta: extractMeta(response),
      };
    },
    payouts: async (query?: { page?: number; per_page?: number }): Promise<DoctorPortalList<DoctorPortalPayout>> => {
      const response = await api.doctorPortal.payments.payouts(query);
      return {
        items: extractItems(response, ["payouts"]).map(normalizePayout),
        meta: extractMeta(response),
      };
    },
  },
};
