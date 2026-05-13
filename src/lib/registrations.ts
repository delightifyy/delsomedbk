import { api, appendFormValue } from "@/lib/api";

export type ApplicantType =
  | "doctor"
  | "organization"
  | "pharmacy"
  | "lab-diagnostics"
  | "patient";

export type DocumentSlot = {
  field: string;
  label: string;
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

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
};

const firstFile = (slot?: DocumentSlot) => slot?.files?.[0];

const slotByField = (documents: DocumentSlot[]) => {
  const map = new Map<string, DocumentSlot>();
  documents.forEach((slot) => map.set(slot.field, slot));
  return map;
};

const appendFile = (form: FormData, key: string, file?: File) => {
  if (file) form.append(key, file);
};

const appendFiles = (form: FormData, key: string, files?: File[]) => {
  files?.forEach((file) => form.append(key, file));
};

const getLookupId = async (
  loader: () => Promise<{ data: any[] }>,
  value: unknown,
  keys: string[] = ["id", "name", "slug", "code"],
) => {
  const direct = toNumber(value);
  if (direct) return direct;

  const expected = normalize(value);
  if (!expected) return undefined;

  const { data } = await loader();
  const found = data.find((item) =>
    keys.some((key) => normalize(item?.[key]) === expected),
  );

  return toNumber(found?.id);
};

const getSubSpecialtyId = async (specialtyId: number | undefined, value: unknown) => {
  const direct = toNumber(value);
  if (direct) return direct;
  if (!specialtyId || !value) return undefined;
  return getLookupId(() => api.lookups.subSpecialties({ specialty_id: specialtyId }), value, ["id", "name", "slug"]);
};

const submitPatientToApi = async (payload: RegistrationPayload) => {
  const details = payload.details as any;
  const nextOfKin = {
    full_name: details.next_of_kin?.full_name ?? details.next_of_kin?.name,
    phone: details.next_of_kin?.phone,
    relationship: details.next_of_kin?.relationship,
  };

  const body: Record<string, unknown> = {
    first_name: details.first_name,
    last_name: details.last_name,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.password,
    phone: payload.phone,
    gender: details.gender,
    date_of_birth: details.date_of_birth,
    how_heard_about_us: details.source,
  };

  if (nextOfKin.full_name || nextOfKin.phone || nextOfKin.relationship) {
    body.next_of_kin = nextOfKin;
  }

  return api.auth.registerPatient(body);
};

const appendCommonApplicationFields = async (form: FormData, payload: RegistrationPayload) => {
  const zoneId = await getLookupId(api.lookups.zones, payload.zone ?? payload.details.zone_id, ["id", "name", "slug", "code"]);
  const stateId = await getLookupId(() => api.lookups.states(zoneId ? { zone_id: zoneId } : undefined), payload.state ?? payload.details.state_id);

  if (!stateId && !payload.details.state_id) {
    throw new Error("State is required. Please select a valid state.");
  }

  appendFormValue(form, "email", payload.email);
  appendFormValue(form, "phone", payload.phone);
  appendFormValue(form, "zone_id", zoneId ?? payload.details.zone_id);
  appendFormValue(form, "state_id", stateId ?? payload.details.state_id);
  appendFormValue(form, "city", payload.city);
  appendFormValue(form, "website", payload.details.website);
  appendFormValue(form, "bio", payload.details.bio ?? payload.details.notes);
  appendFormValue(form, "consent", true);
};

const submitApplicationToApi = async (payload: RegistrationPayload) => {
  const form = new FormData();
  const documents = slotByField(payload.documents);
  const applicationType =
    payload.applicant_type === "lab-diagnostics" ? "diagnostic_lab" : payload.applicant_type;

  appendFormValue(form, "application_type", applicationType);
  await appendCommonApplicationFields(form, payload);

  if (payload.applicant_type === "doctor") {
    const specialtyId = await getLookupId(api.lookups.specialties, payload.specialty, ["id", "name", "slug"]);
    const subSpecialtyId = await getSubSpecialtyId(specialtyId, payload.details.sub_specialty);

    appendFormValue(form, "full_name", payload.full_name);
    appendFormValue(form, "specialty_id", specialtyId ?? payload.details.specialty_id);
    appendFormValue(form, "sub_specialty_id", subSpecialtyId ?? payload.details.sub_specialty_id);
    appendFormValue(form, "is_specialist", Boolean(payload.details.sub_specialty));
    appendFormValue(form, "years_experience", payload.details.years_experience);
    appendFile(form, "documents[medical_practising_licence]", firstFile(documents.get("doc-licence")));
    appendFile(form, "documents[government_id]", firstFile(documents.get("doc-govid")));
    appendFile(form, "documents[indemnity]", firstFile(documents.get("doc-indemnity")));
    appendFile(form, "documents[hospital_licence]", firstFile(documents.get("doc-hospital-licence")));
    appendFile(form, "documents[proof_of_address]", firstFile(documents.get("doc-org-proof")));

    const certFiles = documents.get("doc-certs")?.files ?? [];
    certFiles.slice(0, 5).forEach((file) => {
      appendFile(form, "documents[certifications][]", file);
    });
  }

  if (payload.applicant_type === "organization") {
    const organizationTypeId = await getLookupId(
      api.lookups.organizationTypes,
      payload.details.org_type ?? payload.details.organization_type_id,
      ["id", "name", "slug"],
    );

    appendFormValue(form, "organization_name", payload.organization_name);
    appendFormValue(form, "organization_type_id", organizationTypeId ?? payload.details.organization_type_id);
    appendFormValue(form, "applicant_full_name", payload.full_name);
    appendFormValue(form, "applicant_role", payload.details.role);
    appendFormValue(form, "estimated_members", payload.details.members);
    appendFormValue(form, "address", payload.details.address ?? payload.city);
    appendFile(form, "documents[business_registration]", firstFile(documents.get("doc-licence")));
    appendFile(form, "documents[tax_id]", firstFile(documents.get("doc-govid")));
    appendFile(form, "documents[regulatory_licence]", firstFile(documents.get("doc-certs")));
    appendFile(form, "documents[org_chart]", firstFile(documents.get("doc-org-proof")));
  }

  if (payload.applicant_type === "pharmacy") {
    appendFormValue(form, "pharmacy_name", payload.organization_name);
    appendFormValue(form, "contact_person_name", payload.full_name);
    appendFormValue(form, "pcn_license_number", payload.details.license_number);
    appendFormValue(form, "address", payload.details.address);
    appendFile(form, "documents[pcn_licence]", firstFile(documents.get("doc-licence")));
    appendFile(form, "documents[business_registration]", firstFile(documents.get("doc-certs")) ?? firstFile(documents.get("doc-org-proof")));
    appendFile(form, "documents[pharmacist_id]", firstFile(documents.get("doc-govid")));
    appendFile(form, "documents[premises_photo]", firstFile(documents.get("doc-hospital-licence")));
  }

  if (payload.applicant_type === "lab-diagnostics") {
    appendFormValue(form, "facility_name", payload.organization_name);
    appendFormValue(form, "contact_person_name", payload.full_name);
    appendFormValue(form, "facility_license_number", payload.details.license_number);
    appendFormValue(form, "services_offered", payload.details.services);
    appendFormValue(form, "address", payload.details.address);
    appendFile(form, "documents[facility_licence]", firstFile(documents.get("doc-licence")));
    appendFile(form, "documents[business_registration]", firstFile(documents.get("doc-govid")));
    appendFile(form, "documents[lab_director_credentials]", firstFile(documents.get("doc-certs")) ?? firstFile(documents.get("doc-org-proof")));
    appendFile(form, "documents[accreditation_certificate]", firstFile(documents.get("doc-indemnity")));
    appendFile(form, "documents[equipment_inventory]", firstFile(documents.get("doc-hospital-licence")));
  }

  try {
    return await api.applications.submit(form);
  } catch (error) {
    throw error;
  }
};

export async function submitRegistration(payload: RegistrationPayload) {
  if (payload.applicant_type === "patient") {
    return submitPatientToApi(payload);
  }
  return submitApplicationToApi(payload);
}
