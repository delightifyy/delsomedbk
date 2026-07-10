import { normalizeRoleList } from "@/lib/api";

const NON_PATIENT_ROLES = new Set([
  "admin",
  "administrator",
  "super_admin",
  "doctor",
  "physician",
  "provider",
  "consultant",
  "organization",
  "pharmacy",
  "lab-diagnostics",
]);

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {};

const textOf = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
};

export const unwrapAuthUserPayload = (payload: unknown) => {
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root);
  return asRecord(data.user ?? data.patient ?? data.profile ?? data);
};

export const hasPatientRoleSignal = (value: unknown) => {
  const record = unwrapAuthUserPayload(value);
  const role = textOf(record.role).toLowerCase();
  const userType = textOf(record.user_type).toLowerCase();
  const roles = normalizeRoleList(record.roles);

  return (
    role === "patient" ||
    userType === "patient" ||
    roles.includes("patient") ||
    record.is_patient === true
  );
};

export const hasNonPatientRoleSignal = (value: unknown) => {
  const record = unwrapAuthUserPayload(value);
  const role = textOf(record.role).toLowerCase();
  const userType = textOf(record.user_type).toLowerCase();
  const roles = normalizeRoleList(record.roles);

  return (
    record.is_admin === true ||
    record.is_doctor === true ||
    NON_PATIENT_ROLES.has(role) ||
    NON_PATIENT_ROLES.has(userType) ||
    roles.some((entry) => NON_PATIENT_ROLES.has(entry))
  );
};

export const isExplicitlyNonPatientUser = (value: unknown) =>
  hasNonPatientRoleSignal(value) && !hasPatientRoleSignal(value);

export const hasPatientAccess = (value: unknown) =>
  hasPatientRoleSignal(value) && !hasNonPatientRoleSignal(value);

export const normalizePatientAuthUser = (value: unknown, fallbackEmail = "") => {
  const record = unwrapAuthUserPayload(value);
  const email = textOf(record.email) || fallbackEmail;
  const id = textOf(record.uuid ?? record.id) || email || "patient";
  const roles = normalizeRoleList(record.roles);
  if (!roles.includes("patient")) roles.push("patient");

  const role = textOf(record.role).toLowerCase();
  const userType = textOf(record.user_type).toLowerCase();

  return {
    ...record,
    id,
    uuid: textOf(record.uuid ?? record.id) || id,
    email,
    role: role && !NON_PATIENT_ROLES.has(role) ? role : "patient",
    user_type: userType && !NON_PATIENT_ROLES.has(userType) ? userType : "patient",
    is_admin: false,
    is_doctor: false,
    roles,
  };
};
