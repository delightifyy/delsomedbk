import { type Doctor, type TimeSlot } from "@/data/doctors";
import { resolveApiAssetUrl } from "@/lib/api";
import type {
  LocalAdvert,
  LocalBlogPost,
  LocalContactMessage,
  LocalFaq,
  LocalNewsArticle,
  LocalProfile,
  LocalRegistration,
  LocalRegistrationDoc,
  LocalTestimonial,
  UserType,
} from "@/lib/localStore";

type AnyRecord = Record<string, any>;

export type LookupOption = {
  id: string;
  label: string;
  slug?: string;
  code?: string;
};

const asRecord = (value: unknown): AnyRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : {};

const nested = (source: AnyRecord, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const textOf = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(", ");
  const record = asRecord(value);
  return (
    textOf(record.name) ||
    textOf(record.title) ||
    textOf(record.label) ||
    textOf(record.slug) ||
    textOf(record.code)
  );
};

const pickText = (source: AnyRecord, keys: string[], fallback = "") =>
  textOf(nested(source, keys)) || fallback;

const pickAssetUrl = (source: AnyRecord, keys: string[], fallback = "") =>
  resolveApiAssetUrl(pickText(source, keys, fallback));

const pickNumber = (source: AnyRecord, keys: string[], fallback = 0) => {
  const value = nested(source, keys);
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

const pickBoolean = (source: AnyRecord, keys: string[], fallback = false) => {
  const value = nested(source, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["1", "true", "yes", "published", "active", "read"].includes(value.toLowerCase());
  return fallback;
};

const deriveInitials = (name: string) =>
  (name || "?")
    .replace(/^Dr\.\s+/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const dateLabel = (value?: string | null) => {
  if (!value) return new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
};

const paragraphs = (value: unknown) => {
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean);
  const text = textOf(value);
  return text
    .split(/\n{2,}|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const normalizeStatusPublished = (source: AnyRecord) => {
  const status = pickText(source, ["status", "publication_status", "publish_status"]).toLowerCase();
  if (status) return status === "published" || status === "active";
  return pickBoolean(source, ["published", "is_published", "active", "is_active"], true);
};

const normalizeUserType = (value: unknown): UserType => {
  const text = textOf(value).toLowerCase();
  if (text === "diagnostic_lab" || text === "diagnostics" || text === "laboratory") return "lab-diagnostics";
  if (text === "doctor" || text === "organization" || text === "pharmacy" || text === "patient") return text;
  return "organization";
};

const normalizeAvailability = (value: unknown, fallback: TimeSlot[]) => {
  if (!Array.isArray(value)) return fallback;
  const slots = value
    .map((entry) => {
      const record = asRecord(entry);
      const day = pickText(record, ["day", "weekday", "label"]);
      const rawSlots = record.slots ?? record.times ?? record.availability;
      const slotList = Array.isArray(rawSlots) ? rawSlots.map(textOf).filter(Boolean) : paragraphs(rawSlots);
      return day && slotList.length ? { day, slots: slotList } : null;
    })
    .filter(Boolean) as TimeSlot[];
  return slots.length ? slots : fallback;
};

export const collection = <T = any>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data as T[];
  if (Array.isArray(record.items)) return record.items as T[];
  return [];
};

export const lookupOptionFromApi = (value: unknown): LookupOption => {
  const source = asRecord(value);
  const id = pickText(source, ["id", "uuid", "slug", "code"], crypto.randomUUID());
  const label = pickText(source, ["name", "title", "label", "code", "slug"], "Untitled");

  return {
    id,
    label,
    slug: pickText(source, ["slug"], undefined as unknown as string) || undefined,
    code: pickText(source, ["code"], undefined as unknown as string) || undefined,
  };
};

export const doctorFromApi = (value: unknown, index = 0): Doctor => {
  const source = asRecord(value);
  const profile = asRecord(source.profile ?? source.doctor_profile ?? source.doctor ?? source.user);
  const name = pickText(source, ["name", "full_name", "display_name"], pickText(profile, ["name", "full_name"], "Unnamed doctor"));
  const specialty =
    pickText(source, ["specialty", "specialty_name", "primary_specialty"], pickText(profile, ["specialty", "specialty_name"], "General Practice")) ||
    "General Practice";

  return {
    id: pickText(source, ["uuid", "id", "user_uuid", "user_id"], pickText(profile, ["uuid", "id"], `doctor-${index}`)),
    name,
    specialty,
    zone: pickText(source, ["zone", "zone_name", "zone_code"], pickText(profile, ["zone", "zone_name"], "")),
    state: pickText(source, ["state", "state_name"], pickText(profile, ["state", "state_name"], "")),
    city: pickText(source, ["city"], pickText(profile, ["city"], "")),
    bio: pickText(source, ["bio", "about", "summary", "description"], pickText(profile, ["bio", "about"], "")),
    initials: pickText(source, ["initials"], "",) || deriveInitials(name),
    profile_url:
      (asRecord(source.mini_site) && pickText(asRecord(source.mini_site), ["public_url", "publicUrl"])) ||
      (asRecord(source.miniSite) && pickText(asRecord(source.miniSite), ["public_url", "publicUrl"])) ||
      pickText(source, ["public_url", "publicUrl", "profile_url", "profileUrl"]) ||
      pickText(profile, ["public_url", "profile_url", "profileUrl"]) ||
      undefined,
    yearsExperience: pickNumber(source, ["years_experience", "experience_years", "yearsExperience"], 0),
    photo: pickAssetUrl(source, ["avatar_url", "photo", "photo_url", "image_url"], pickText(profile, ["avatar_url", "photo_url"], "")) || undefined,
    consultationFee: pickNumber(source, ["consultation_fee", "consultationFee", "fee"], 0),
    availability: normalizeAvailability(source.availability ?? profile.availability, []),
  };
};

export const newsArticleFromApi = (value: unknown): LocalNewsArticle => {
  const source = asRecord(value);
  const category = source.category ?? source.post_category;
  const createdAt = pickText(source, ["published_at", "created_at", "updated_at"], new Date().toISOString());

  return {
    id: pickText(source, ["uuid", "id", "slug"], crypto.randomUUID()),
    slug: pickText(source, ["slug"], pickText(source, ["uuid", "id"], crypto.randomUUID())),
    title: pickText(source, ["title", "name"], "Untitled story"),
    category: textOf(category) || "General",
    date: pickText(source, ["date_label", "published_label"], dateLabel(createdAt)),
    excerpt: pickText(source, ["excerpt", "summary", "description"], ""),
    body: paragraphs(source.body ?? source.content ?? source.description),
    cover_image: pickAssetUrl(source, ["cover_image", "featured_image", "hero_image_url", "image_url", "banner_url"], null as unknown as string) || null,
    author: pickText(source, ["author", "author_name", "external_source"], null as unknown as string),
    published: normalizeStatusPublished(source),
    created_at: createdAt,
  };
};

export const blogPostFromApi = (value: unknown): LocalBlogPost => {
  const source = asRecord(value);
  return {
    id: pickText(source, ["uuid", "id"], crypto.randomUUID()),
    title: pickText(source, ["title", "name"], "Untitled post"),
    slug: pickText(source, ["slug"], pickText(source, ["uuid", "id"], crypto.randomUUID())),
    excerpt: pickText(source, ["excerpt", "summary", "description"], null as unknown as string),
    content: pickText(source, ["content", "body"], null as unknown as string),
    cover_image: pickAssetUrl(source, ["cover_image", "featured_image", "hero_image_url", "image_url", "banner_url"], null as unknown as string) || null,
    published: normalizeStatusPublished(source),
    author_id: pickText(source, ["author_id", "user_id"], null as unknown as string),
    created_at: pickText(source, ["created_at", "published_at", "updated_at"], new Date().toISOString()),
  };
};

export const advertFromApi = (value: unknown): LocalAdvert => {
  const source = asRecord(value);
  const services = collection(source.services);
  const zones = collection(source.zones);
  const service = source.service ?? source.category ?? (services.length ? services.map(textOf).filter(Boolean).join(", ") : undefined);
  const zone = source.zone ?? source.zone_name ?? source.zone_code ?? (zones.length ? zones.map(textOf).filter(Boolean).join(", ") : undefined);
  const createdAt = pickText(source, ["created_at", "published_at", "updated_at"], new Date().toISOString());

  return {
    id: pickText(source, ["uuid", "id"], crypto.randomUUID()),
    title: pickText(source, ["title", "name"], "Untitled advert"),
    sponsor: pickText(source, ["provider_name", "sponsor", "organization_name", "company", "brand"], "DesolMed partner"),
    category: textOf(service) || "Health",
    zone: textOf(zone),
    state: pickText(source, ["state", "state_name"], ""),
    city: pickText(source, ["city", "address"], ""),
    description: pickText(source, ["description", "excerpt", "summary", "content", "body", "subtitle"], ""),
    published: normalizeStatusPublished(source),
    image: pickAssetUrl(source, ["banner_image_url", "image", "image_url", "cover_image", "banner_url"], null as unknown as string) || null,
    date_label: pickText(source, ["date_label"], dateLabel(createdAt)),
    read_time: pickText(source, ["read_time"], "6 min read"),
    author: pickText(source, ["author", "author_name", "provider_name"], null as unknown as string),
    author_role: pickText(source, ["author_role", "role", "price_text", "address"], null as unknown as string),
    cta_label: pickText(source, ["cta_label"], "Read the story"),
    created_at: createdAt,
  };
};

export const contactMessageFromApi = (value: unknown): LocalContactMessage => {
  const source = asRecord(value);
  const status = pickText(source, ["status"], "").toLowerCase();
  return {
    id: pickText(source, ["id", "uuid"], crypto.randomUUID()),
    name: pickText(source, ["name", "full_name"], "Unknown sender"),
    email: pickText(source, ["email"], ""),
    subject: pickText(source, ["subject"], "Contact message"),
    message: pickText(source, ["message", "body", "content"], ""),
    state: pickText(source, ["state", "state_name"], null as unknown as string),
    read: status ? status !== "new" : pickBoolean(source, ["read", "is_read"], false),
    created_at: pickText(source, ["created_at", "submitted_at"], new Date().toISOString()),
  };
};

const documentFromApi = (value: unknown, appUuid: string): LocalRegistrationDoc => {
  const source = asRecord(value);
  const id = pickText(source, ["id", "document_id", "uuid"], crypto.randomUUID());
  const fileSizeKb = pickNumber(source, ["file_size_kb"], 0);
  const name = pickText(source, ["original_filename", "original_file_name", "original_name", "file_name", "filename", "name"], `Document ${id}`);
  return {
    label: pickText(source, ["label", "document_type", "type"], name),
    field: pickText(source, ["document_type", "field", "type"], "document"),
    path: `${appUuid}:${id}`,
    name,
    size: pickNumber(source, ["size", "file_size", "file_size_bytes"], fileSizeKb ? fileSizeKb * 1024 : 0),
    type: pickText(source, ["mime_type", "content_type"], "application/octet-stream"),
    dataUrl: pickText(source, ["download_url", "url", "temporary_url"], ""),
  };
};

export const registrationFromApi = (value: unknown): LocalRegistration => {
  const source = asRecord(value);
  const payload = asRecord(source.payload ?? source.details ?? source.data ?? source.form_data ?? source.application_data);
  const applicantType = normalizeUserType(source.application_type ?? source.type ?? payload.application_type);
  const id = pickText(source, ["uuid", "id"], crypto.randomUUID());
  const organizationName = pickText(
    source,
    [
      "applicant_organization",
      "applicant_organization_name",
      "organization_name",
      "name_of_organization",
      "name_of_pharmacy",
      "name_of_laboratory_diagnostics",
      "business_name",
      "company_name",
    ],
    pickText(
      payload,
      [
        "applicant_organization",
        "applicant_organization_name",
        "organization_name",
        "name_of_organization",
        "name_of_pharmacy",
        "name_of_laboratory_diagnostics",
        "business_name",
        "company_name",
      ],
      "",
    ),
  );
  const fullName = pickText(
    source,
    ["applicant_name", "applicant_full_name", "full_name", "name", "contact_person_name", "doctor_name"],
    pickText(payload, ["applicant_name", "applicant_full_name", "full_name", "name", "contact_person_name", "doctor_name"], ""),
  );
  const details = { ...payload };

  return {
    id,
    applicant_type: applicantType,
    status: (pickText(source, ["status"], "pending") as LocalRegistration["status"]) || "pending",
    full_name: fullName || null,
    organization_name: organizationName || null,
    email: pickText(source, ["applicant_email", "email"], pickText(payload, ["applicant_email", "email"], "")),
    phone: pickText(source, ["applicant_phone", "phone", "phone_number"], pickText(payload, ["applicant_phone", "phone", "phone_number"], null as unknown as string)),
    city: pickText(source, ["city"], pickText(payload, ["city"], null as unknown as string)),
    state: pickText(source, ["state", "state_name"], pickText(payload, ["state", "state_name"], null as unknown as string)),
    zone: pickText(source, ["zone", "zone_name"], pickText(payload, ["zone", "zone_name"], null as unknown as string)),
    specialty: pickText(
      source,
      ["specialty", "specialty_name", "backend_specialty", "backend_specialty_name"],
      pickText(
        payload,
        ["specialty", "specialty_name", "backend_specialty", "backend_specialty_name"],
        null as unknown as string,
      ),
    ),
    details,
    documents: collection(source.documents ?? payload.documents).map((doc) => documentFromApi(doc, id)),
    reviewer_notes: pickText(source, ["reviewer_notes", "review_note", "note", "rejection_reason"], null as unknown as string),
    reviewed_at: pickText(source, ["reviewed_at"], null as unknown as string),
    created_at: pickText(source, ["submitted_at", "created_at"], new Date().toISOString()),
  };
};

export const userProfileFromApi = (value: unknown): LocalProfile & { role?: string; status?: string } => {
  const source = asRecord(value);
  const account = asRecord(source.user ?? source.account ?? source.member);
  const primary = Object.keys(account).length ? { ...source, ...account } : source;
  const profile = asRecord(source.profile ?? account.profile ?? source.doctor_profile ?? account.doctor_profile);
  const roles = collection<string>(primary.roles ?? source.roles);
  const firstLast = [pickText(primary, ["first_name"], pickText(profile, ["first_name"], "")), pickText(primary, ["last_name"], pickText(profile, ["last_name"], ""))]
    .filter(Boolean)
    .join(" ");
  const userType = normalizeUserType(primary.user_type ?? primary.type ?? profile.user_type ?? roles[0]);
  const displayName = pickText(primary, ["full_name", "name", "display_name"], pickText(profile, ["full_name", "name", "display_name"], firstLast));

  return {
    id: pickText(primary, ["uuid", "id", "user_uuid", "user_id"], pickText(profile, ["uuid", "id"], crypto.randomUUID())),
    full_name: displayName || null,
    avatar_url: pickAssetUrl(primary, ["avatar_url", "photo_url", "image_url"], pickText(profile, ["avatar_url", "photo_url", "image_url"], null as unknown as string)) || null,
    email: pickText(primary, ["email"], pickText(profile, ["email"], null as unknown as string)),
    phone: pickText(primary, ["phone", "phone_number"], pickText(profile, ["phone", "phone_number"], null as unknown as string)),
    organization_name: pickText(primary, ["organization_name", "business_name", "company_name"], pickText(profile, ["organization_name", "business_name", "company_name"], null as unknown as string)),
    user_type: userType,
    website_url: pickText(primary, ["website", "website_url"], pickText(profile, ["website", "website_url"], null as unknown as string)),
    created_at: pickText(primary, ["created_at"], pickText(profile, ["created_at"], new Date().toISOString())),
    role: pickText(primary, ["role", "role_name"], textOf(roles[0] ?? primary.roles)),
    status: pickText(primary, ["status", "account_status"], pickText(profile, ["status", "account_status"], "active")),
  };
};

export const faqFromApi = (value: unknown): LocalFaq => {
  const source = asRecord(value);
  return {
    id: pickText(source, ["id", "uuid"], crypto.randomUUID()),
    q: pickText(source, ["q", "question", "title"], "Untitled question"),
    a: pickText(source, ["a", "answer", "body", "content"], ""),
    published: normalizeStatusPublished(source),
    sort_order: pickNumber(source, ["sort_order"], 0),
    created_at: pickText(source, ["created_at", "updated_at"], new Date().toISOString()),
  };
};

export const testimonialFromApi = (value: unknown): LocalTestimonial => {
  const source = asRecord(value);
  const name = pickText(source, ["author_name", "name", "author", "customer_name"], "Anonymous");
  return {
    id: pickText(source, ["id", "uuid"], crypto.randomUUID()),
    quote: pickText(source, ["quote", "body", "content", "text"], ""),
    name,
    role: pickText(source, ["author_role", "role", "title", "designation"], "Patient"),
    initials: pickText(source, ["initials"], deriveInitials(name)),
    avatar_url: pickAssetUrl(source, ["avatar_url", "avatar", "photo_url", "image_url", "image"], null as unknown as string) || null,
    published: normalizeStatusPublished(source),
    created_at: pickText(source, ["created_at", "updated_at"], new Date().toISOString()),
  };
};
