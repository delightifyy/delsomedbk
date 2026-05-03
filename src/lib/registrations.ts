import { createRegistration } from "@/lib/localStore";

export type ApplicantType =
  | "doctor"
  | "organization"
  | "pharmacy"
  | "lab-diagnostics"
  | "patient";

export type DocumentSlot = {
  field: string; // e.g. "doc-licence"
  label: string; // e.g. "Medical licence"
  files: File[];
};

export type RegistrationPayload = {
  applicant_type: ApplicantType;
  full_name?: string | null;
  organization_name?: string | null;
  email: string;
  password?: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  zone?: string | null;
  specialty?: string | null;
  details: Record<string, unknown>;
  documents: DocumentSlot[];
};

const safeName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);

export async function submitRegistration(payload: RegistrationPayload) {
  const documents = payload.documents.flatMap((slot) =>
    slot.files.map((file) => ({ label: slot.label, field: slot.field, file }))
  );

  await createRegistration({
    applicant_type: payload.applicant_type,
    full_name: payload.full_name ?? null,
    organization_name: payload.organization_name ?? null,
    email: payload.email,
    password: payload.password,
    phone: payload.phone ?? null,
    city: payload.city ?? null,
    state: payload.state ?? null,
    zone: payload.zone ?? null,
    specialty: payload.specialty ?? null,
    details: payload.details,
    documents,
  });
}
