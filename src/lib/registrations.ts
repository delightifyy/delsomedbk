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
  loader: () => Promise<{ data: unknown[] }>,
  value: unknown,
  keys: string[] = ["id", "name", "slug", "code"],
) => {
  const direct = toNumber(value);
  if (direct) return direct;

  const expected = normalize(value);
  if (!expected) return undefined;

  const { data } = await loader();
  const found = data.find((item) => {
    const record = item as Record<string, unknown>;
    return keys.some((key) => normalize(record?.[key]) === expected);
  });

  return toNumber((found as Record<string, unknown> | undefined)?.id);
};

const getSubSpecialtyId = async (specialtyId: number | undefined, value: unknown) => {
  const direct = toNumber(value);
  if (direct) return direct;
  if (!specialtyId || !value) return undefined;
  return getLookupId(() => api.lookups.subSpecialties({ specialty_id: specialtyId }), value, ["id", "name", "slug"]);
};

const asText = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || undefined;
};

const appendDocument = (form: FormData, key: string, documents: Map<string, DocumentSlot>) => {
  appendFile(form, key, firstFile(documents.get(key)));
};

const appendDocumentFiles = (form: FormData, key: string, documents: Map<string, DocumentSlot>, sourceField: string) => {
  appendFiles(form, key, documents.get(sourceField)?.files);
};

const submitPatientToApi = async (payload: RegistrationPayload) => {
  const details = payload.details as Record<string, unknown> & {
    first_name?: unknown;
    last_name?: unknown;
    gender?: unknown;
    date_of_birth?: unknown;
    how_heard_about_us?: unknown;
    source?: unknown;
    next_of_kin?: {
      full_name?: unknown;
      name?: unknown;
      phone?: unknown;
      relationship?: unknown;
    };
  };
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
    how_heard_about_us: details.how_heard_about_us ?? details.source,
  };

  if (nextOfKin.full_name || nextOfKin.phone || nextOfKin.relationship) {
    body.next_of_kin = nextOfKin;
  }

  return api.auth.registerPatient(body);
};

const appendCommonApplicationFields = async (form: FormData, payload: RegistrationPayload) => {
  const zoneId = await getLookupId(api.lookups.zones, payload.details.zone_id ?? payload.zone, ["id", "name", "slug", "code"]);
  const stateId = await getLookupId(
    () => api.lookups.states(zoneId ? { zone_id: zoneId } : undefined),
    payload.details.state_id ?? payload.state,
  );

  if (!zoneId) {
    throw new Error("Zone is required. Please select a valid zone.");
  }

  if (!stateId) {
    throw new Error("State is required. Please select a valid state.");
  }

  appendFormValue(form, "email", payload.email);
  appendFormValue(form, "phone", payload.phone);
  appendFormValue(form, "zone_id", zoneId);
  appendFormValue(form, "state_id", stateId);
  appendFormValue(form, "city", payload.city);
  appendFormValue(form, "address", payload.details.address);
  appendFormValue(form, "consent", true);

  return { zoneId, stateId };
};

const submitApplicationToApi = async (payload: RegistrationPayload) => {
  const form = new FormData();
  const documents = slotByField(payload.documents);
  const applicationType =
    payload.applicant_type === "lab-diagnostics" ? "diagnostic_lab" : payload.applicant_type;

  appendFormValue(form, "application_type", applicationType);
  await appendCommonApplicationFields(form, payload);

  if (payload.applicant_type === "doctor") {
    const specialtyId = await getLookupId(api.lookups.specialties, payload.details.specialty_id ?? payload.specialty, ["id", "name", "slug"]);
    const subSpecialtyId = await getSubSpecialtyId(specialtyId, payload.details.sub_specialty_id ?? payload.details.sub_specialty);

    appendFormValue(form, "name_of_organization", payload.details.name_of_organization ?? payload.organization_name);
    appendFormValue(form, "name_of_responsible_officer", payload.details.name_of_responsible_officer ?? payload.full_name);
    appendFormValue(form, "role", payload.details.role);
    appendFormValue(form, "specialty_id", specialtyId);
    appendFormValue(form, "sub_specialty_id", subSpecialtyId);
    appendFormValue(form, "years_experience", payload.details.years_experience);
    appendFormValue(form, "organization_email", payload.details.organization_email ?? payload.details.email ?? payload.email);
    appendFormValue(form, "website", payload.details.website);
    appendFormValue(form, "services_offered", payload.details.services_offered ?? payload.details.services);
    appendFormValue(form, "review_note", payload.details.review_note);
    appendFormValue(form, "hospital_license_expiry_date", payload.details.hospital_license_expiry_date ?? payload.details.hospital_licence_expiry);
    appendDocumentFiles(form, "documents[hospital_licence]", documents, "doc-hospital-licence");
    appendDocumentFiles(form, "documents[doctor_practicing_licence]", documents, "doc-licence");
    appendDocumentFiles(form, "documents[government_id]", documents, "doc-govid");
    appendDocumentFiles(form, "documents[proof_of_address]", documents, "doc-org-proof");
    appendDocumentFiles(form, "documents[indemnity_of_organization]", documents, "doc-indemnity");
    appendDocumentFiles(form, "documents[other_documents][]", documents, "doc-other");
    appendDocumentFiles(form, "documents[certifications][]", documents, "doc-certs");
  }

  if (payload.applicant_type === "organization") {
    const organizationTypeId = await getLookupId(
      api.lookups.organizationTypes,
      payload.details.organization_type_id ?? payload.details.org_type,
      ["id", "name", "slug"],
    );
    appendFormValue(form, "name_of_organization", payload.details.name_of_organization ?? payload.organization_name);
    appendFormValue(form, "organization_type_id", organizationTypeId);
    appendFormValue(form, "estimated_members", payload.details.estimated_members ?? payload.details.members);
    appendFormValue(form, "name_of_responsible_officer", payload.details.name_of_responsible_officer ?? payload.full_name);
    appendFormValue(form, "role", payload.details.role);
    appendFormValue(form, "work_email", payload.details.work_email ?? payload.details.email ?? payload.email);
    appendFormValue(form, "organization_provider", payload.details.organization_provider);
    appendFormValue(form, "desolmed_help_needed", payload.details.desolmed_help_needed ?? payload.details.notes);
    appendDocumentFiles(form, "documents[hmo_registration_operating_licence]", documents, "doc-licence");
    appendDocumentFiles(form, "documents[government_id]", documents, "doc-govid");
    appendDocumentFiles(form, "documents[certifications][]", documents, "doc-certs");
    appendDocumentFiles(form, "documents[other_documents][]", documents, "doc-other");
  }

  if (payload.applicant_type === "pharmacy") {
    appendFormValue(form, "name_of_pharmacy", payload.details.name_of_pharmacy ?? payload.organization_name);
    appendFormValue(form, "license_registration_number", payload.details.license_registration_number ?? payload.details.license_number);
    appendFormValue(form, "year_established", payload.details.year_established);
    appendFormValue(form, "name_of_responsible_officer", payload.details.name_of_responsible_officer ?? payload.full_name);
    appendFormValue(form, "role", payload.details.role);
    appendFormValue(form, "work_email", payload.details.work_email ?? payload.details.email ?? payload.email);
    appendFormValue(form, "services_offered", payload.details.services_offered ?? payload.details.services);
    appendDocumentFiles(form, "documents[pharmacy_operating_licence]", documents, "doc-licence");
    appendDocumentFiles(form, "documents[government_id]", documents, "doc-govid");
    appendDocumentFiles(form, "documents[indemnity_of_organization]", documents, "doc-indemnity");
    appendDocumentFiles(form, "documents[business_registration_certifications][]", documents, "doc-certs");
    appendDocumentFiles(form, "documents[other_documents][]", documents, "doc-other");
  }

  if (payload.applicant_type === "lab-diagnostics") {
    appendFormValue(form, "name_of_laboratory_diagnostics", payload.details.name_of_laboratory_diagnostics ?? payload.organization_name);
    appendFormValue(form, "license_registration_number", payload.details.license_registration_number ?? payload.details.license_number);
    appendFormValue(form, "year_established", payload.details.year_established);
    appendFormValue(form, "name_of_responsible_officer", payload.details.name_of_responsible_officer ?? payload.full_name);
    appendFormValue(form, "role", payload.details.role);
    appendFormValue(form, "work_email", payload.details.work_email ?? payload.details.email ?? payload.email);
    appendFormValue(form, "services_offered", payload.details.services_offered ?? payload.details.services);
    appendDocumentFiles(form, "documents[laboratory_diagnostics_operating_licence]", documents, "doc-licence");
    appendDocumentFiles(form, "documents[government_id]", documents, "doc-govid");
    appendDocumentFiles(form, "documents[proof_of_address]", documents, "doc-org-proof");
    appendDocumentFiles(form, "documents[indemnity_of_organization]", documents, "doc-indemnity");
    appendDocumentFiles(form, "documents[certifications][]", documents, "doc-certs");
    appendDocumentFiles(form, "documents[other_documents][]", documents, "doc-other");
  }

  return api.applications.submit(form);
};

export async function submitRegistration(payload: RegistrationPayload) {
  if (payload.applicant_type === "patient") {
    return submitPatientToApi(payload);
  }
  return submitApplicationToApi(payload);
}
