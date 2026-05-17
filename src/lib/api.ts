const DEFAULT_API_BASE_URL = "https://delsomed.itl.ng/api/v1";

const isLocalhostHost = (host: string) =>
  ["localhost", "127.0.0.1", "::1"].includes(host.toLowerCase());

const normalizeApiBaseUrl = (value?: string) => {
  const trimmed = String(value ?? "").trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_API_BASE_URL;

  if (/^localhost(?:\/|$)/i.test(trimmed)) {
    return DEFAULT_API_BASE_URL;
  }

  try {
    const parsed = new URL(trimmed);
    const allowLocalApi = (import.meta.env.VITE_ALLOW_LOCAL_API as string | undefined) === "true";

    if (isLocalhostHost(parsed.hostname) && !parsed.port && !allowLocalApi) {
      return DEFAULT_API_BASE_URL;
    }

    return trimmed;
  } catch {
    return trimmed.startsWith("/api/") ? trimmed : DEFAULT_API_BASE_URL;
  }
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);

export const API_FALLBACK_TO_LOCAL =
  (import.meta.env.VITE_API_FALLBACK_TO_LOCAL as string | undefined) === "true";

const TOKEN_KEY = "carehub:api-token";
const SESSION_KEY = "carehub-local-session";
const AUTH_EVENT = "carehub-auth-change";

export type ApiEnvelope<T = unknown, M = Record<string, unknown>> = {
  data: T;
  meta?: M;
  errors?: unknown;
  message?: string | null;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export class ApiError extends Error {
  status: number;
  errors: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: BodyInit | Record<string, unknown> | null;
  query?: QueryParams;
};

export const getStoredAuthToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setStoredAuthToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
};

export const clearStoredAuthToken = () => setStoredAuthToken(null);

export const clearApiAuthState = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

const queryString = (query?: QueryParams) => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    params.set(key, String(value));
  });
  const text = params.toString();
  return text ? `?${text}` : "";
};

export function buildApiUrl(path: string, query?: QueryParams) {
  if (path.startsWith("http")) return `${path}${queryString(query)}`;
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}${queryString(query)}`;
}

export const API_ASSET_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/v\d+.*$/i, "").replace(/\/+$/, "");
  }
})();

export function resolveApiAssetUrl(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  if (raw.startsWith("//")) {
    const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
    return `${protocol}${raw}`;
  }

  const cleaned = raw
    .replace(/\\/g, "/")
    .replace(/^public\//i, "")
    .replace(/^\/+/, "");

  return cleaned ? `${API_ASSET_ORIGIN}/${cleaned}` : "";
}

async function parseResponse<T, M = Record<string, unknown>>(response: Response): Promise<ApiEnvelope<T, M>> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as ApiEnvelope<T, M>;
  }
  return { data: (await response.text()) as T };
}

export async function apiRequest<T = unknown, M = Record<string, unknown>>(
  path: string,
  { auth = false, headers, body, query, ...requestOptions }: ApiRequestOptions = {},
) {
  const finalHeaders = new Headers(headers);
  let finalBody: BodyInit | undefined;

  if (body instanceof FormData) {
    finalBody = body;
  } else if (body instanceof Blob || typeof body === "string" || body instanceof URLSearchParams) {
    finalBody = body;
  } else if (body !== undefined && body !== null) {
    finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  finalHeaders.set("Accept", "application/json");

  if (auth) {
    const token = getStoredAuthToken();
    if (!token) {
      clearApiAuthState();
      throw new ApiError("Your admin session has expired. Please sign in again.", 401);
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path, query), {
    ...requestOptions,
    headers: finalHeaders,
    body: finalBody,
  });

  const payload = await parseResponse<T, M>(response);

  if (!response.ok) {
    if (auth && response.status === 401) {
      clearApiAuthState();
    }
    const message =
      typeof payload.message === "string" && payload.message
        ? payload.message
        : `API request failed (${response.status})`;
    throw new ApiError(message, response.status, payload.errors);
  }

  return payload;
}

const filenameFromDisposition = (value: string | null) => {
  if (!value) return undefined;
  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
  const plainMatch = value.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1];
};

export async function apiFileRequest(
  path: string,
  { auth = false, headers, query, ...requestOptions }: Omit<ApiRequestOptions, "body"> = {},
) {
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "*/*");

  if (auth) {
    const token = getStoredAuthToken();
    if (!token) {
      clearApiAuthState();
      throw new ApiError("Your admin session has expired. Please sign in again.", 401);
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path, query), {
    ...requestOptions,
    headers: finalHeaders,
  });

  if (!response.ok) {
    if (auth && response.status === 401) {
      clearApiAuthState();
    }

    let message = `File download failed (${response.status})`;
    let errors: unknown;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = await response.json() as ApiEnvelope;
      message = typeof payload.message === "string" && payload.message ? payload.message : message;
      errors = payload.errors;
    } else {
      const text = await response.text();
      if (text) message = text;
    }

    throw new ApiError(message, response.status, errors);
  }

  return {
    blob: await response.blob(),
    contentType: response.headers.get("content-type") || "application/octet-stream",
    filename: filenameFromDisposition(response.headers.get("content-disposition")),
  };
}

export const appendFormValue = (form: FormData, key: string, value: unknown) => {
  if (value === null || value === undefined || value === "") return;
  if (value instanceof Blob) {
    form.append(key, value);
    return;
  }
  if (typeof value === "boolean") {
    form.append(key, value ? "1" : "0");
    return;
  }
  form.append(key, String(value));
};

export const api = {
  auth: {
    registerPatient: (body: Record<string, unknown>) =>
      apiRequest("/auth/patients/register", { method: "POST", body }),
    patientLogin: (body: { email: string; password: string }) =>
      apiRequest<{ token: string; token_type: string; expires_in: number; user: any }>("/auth/patients/login", {
        method: "POST",
        body,
      }),
    adminLogin: (body: { email: string; password: string }) =>
      apiRequest<{ token: string; token_type: string; expires_in: number; user: any }>("/auth/admin/login", {
        method: "POST",
        body,
      }),
    forgotPassword: (email: string) => apiRequest("/auth/password/forgot", { method: "POST", body: { email } }),
    resetPassword: (body: Record<string, unknown>) =>
      apiRequest("/auth/password/reset", { method: "POST", body }),
    resendVerification: () => apiRequest("/auth/email/verify/resend", { method: "POST", auth: true }),
    me: () => apiRequest("/auth/me", { auth: true }),
    refresh: () =>
      apiRequest<{ token: string; token_type: string; expires_in: number }>("/auth/refresh", {
        method: "POST",
        auth: true,
      }),
    logout: () => apiRequest("/auth/logout", { method: "POST", auth: true }),
  },

  applications: {
    submit: (form: FormData) => apiRequest("/applications", { method: "POST", body: form }),
    status: (uuid: string) => apiRequest(`/applications/status/${uuid}`),
  },

  lookups: {
    zones: () => apiRequest<any[]>("/lookups/zones"),
    states: (query?: QueryParams) => apiRequest<any[]>("/lookups/states", { query }),
    cities: (query?: QueryParams) => apiRequest<any[]>("/lookups/cities", { query }),
    specialties: (query?: QueryParams) => apiRequest<any[]>("/lookups/specialties", { query }),
    subSpecialties: (query?: QueryParams) => apiRequest<any[]>("/lookups/sub-specialties", { query }),
    organizationTypes: () => apiRequest<any[]>("/lookups/organization-types"),
    services: () => apiRequest<any[]>("/lookups/services"),
    postCategories: () => apiRequest<any[]>("/lookups/post-categories"),
  },

  doctors: {
    list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/doctors", { query }),
    detail: (uuid: string) => apiRequest(`/doctors/${uuid}`),
  },

  posts: {
    list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/posts", { query }),
    detail: (slug: string) => apiRequest(`/posts/${slug}`),
    related: (slug: string, query?: QueryParams) => apiRequest<any[]>(`/posts/${slug}/related`, { query }),
  },

  adverts: {
    list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/adverts", { query }),
    detail: (uuid: string) => apiRequest(`/adverts/${uuid}`),
  },

  cms: {
    page: (key: string) => apiRequest(`/pages/${key}`),
    siteSettings: () => apiRequest("/site-settings"),
    faqs: () => apiRequest<any[]>("/faqs"),
    testimonials: () => apiRequest<any[]>("/testimonials"),
    partners: () => apiRequest<any[]>("/partners"),
  },

  contact: {
    submit: (body: Record<string, unknown>) => apiRequest("/contact", { method: "POST", body }),
  },

  newsletter: {
    subscribe: (body: { email: string }) => apiRequest("/newsletter/subscribe", { method: "POST", body }),
    confirm: (token: string) => apiRequest(`/newsletter/confirm/${token}`),
    unsubscribe: (token: string) => apiRequest(`/newsletter/unsubscribe/${token}`),
  },

  me: {
    profile: () => apiRequest("/me/profile", { auth: true }),
    updateProfile: (body: Record<string, unknown>) =>
      apiRequest("/me/profile", { method: "PATCH", auth: true, body }),
    uploadAvatar: (form: FormData) =>
      apiRequest("/me/profile/avatar", { method: "POST", auth: true, body: form }),
  },

  admin: {
    applications: {
      list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/admin/applications", { auth: true, query }),
      detail: (uuid: string) => apiRequest(`/admin/applications/${uuid}`, { auth: true }),
      approve: (uuid: string, note?: string) =>
        apiRequest(`/admin/applications/${uuid}/approve`, { method: "POST", auth: true, body: { note } }),
      reject: (uuid: string, reason: string) =>
        apiRequest(`/admin/applications/${uuid}/reject`, { method: "POST", auth: true, body: { reason } }),
      note: (uuid: string, note: string) =>
        apiRequest(`/admin/applications/${uuid}/notes`, { method: "POST", auth: true, body: { note } }),
      downloadDocument: (uuid: string, documentId: number | string) =>
        apiFileRequest(`/admin/applications/${uuid}/documents/${documentId}/download`, { auth: true }),
      documentUrl: (uuid: string, documentId: number | string) =>
        buildApiUrl(`/admin/applications/${uuid}/documents/${documentId}/download`),
    },

    users: {
      list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/admin/users", { auth: true, query }),
      detail: (uuid: string) => apiRequest(`/admin/users/${uuid}`, { auth: true }),
      suspend: (uuid: string, reason?: string) =>
        apiRequest(`/admin/users/${uuid}/suspend`, { method: "POST", auth: true, body: { reason } }),
      activate: (uuid: string) => apiRequest(`/admin/users/${uuid}/activate`, { method: "POST", auth: true }),
      delete: (uuid: string) => apiRequest(`/admin/users/${uuid}`, { method: "DELETE", auth: true }),
      assignRole: (uuid: string, role: string) =>
        apiRequest(`/admin/users/${uuid}/assign-role`, { method: "POST", auth: true, body: { role } }),
    },

    posts: {
      list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/admin/posts", { auth: true, query }),
      create: (body: FormData | Record<string, unknown>) =>
        apiRequest("/admin/posts", { method: "POST", auth: true, body }),
      detail: (uuid: string) => apiRequest(`/admin/posts/${uuid}`, { auth: true }),
      update: (uuid: string, body: FormData | Record<string, unknown>) =>
        apiRequest(`/admin/posts/${uuid}`, { method: "POST", auth: true, body }),
      delete: (uuid: string) => apiRequest(`/admin/posts/${uuid}`, { method: "DELETE", auth: true }),
      notifySubscribers: (uuid: string) =>
        apiRequest(`/admin/posts/${uuid}/notify-subscribers`, { method: "POST", auth: true }),
    },

    adverts: {
      list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/admin/adverts", { auth: true, query }),
      create: (body: FormData | Record<string, unknown>) =>
        apiRequest("/admin/adverts", { method: "POST", auth: true, body }),
      detail: (uuid: string) => apiRequest(`/admin/adverts/${uuid}`, { auth: true }),
      update: (uuid: string, body: FormData | Record<string, unknown>) =>
        apiRequest(`/admin/adverts/${uuid}`, { method: "POST", auth: true, body }),
      delete: (uuid: string) => apiRequest(`/admin/adverts/${uuid}`, { method: "DELETE", auth: true }),
      bulkPublish: (uuids: string[]) =>
        apiRequest("/admin/adverts/bulk-publish", { method: "POST", auth: true, body: { uuids } }),
      bulkUnpublish: (uuids: string[]) =>
        apiRequest("/admin/adverts/bulk-unpublish", { method: "POST", auth: true, body: { uuids } }),
      bulkDelete: (uuids: string[]) =>
        apiRequest("/admin/adverts/bulk-delete", { method: "POST", auth: true, body: { uuids } }),
    },

    contactMessages: {
      list: (query?: QueryParams) =>
        apiRequest<any[], PaginationMeta>("/admin/contact-messages", { auth: true, query }),
      detail: (id: string | number) => apiRequest(`/admin/contact-messages/${id}`, { auth: true }),
      updateStatus: (id: string | number, status: "new" | "read" | "archived") =>
        apiRequest(`/admin/contact-messages/${id}`, { method: "PATCH", auth: true, body: { status } }),
      delete: (id: string | number) =>
        apiRequest(`/admin/contact-messages/${id}`, { method: "DELETE", auth: true }),
    },

    newsletter: {
      subscribers: (query?: QueryParams) =>
        apiRequest<any[], PaginationMeta>("/admin/newsletter/subscribers", { auth: true, query }),
      exportUrl: () => buildApiUrl("/admin/newsletter/export.csv"),
    },

    activityLogs: {
      list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/admin/activity-logs", { auth: true, query }),
      detail: (id: string | number) => apiRequest(`/admin/activity-logs/${id}`, { auth: true }),
    },

    cms: {
      pages: {
        list: () => apiRequest<any[]>("/admin/cms/pages", { auth: true }),
        create: (body: Record<string, unknown>) =>
          apiRequest("/admin/cms/pages", { method: "POST", auth: true, body }),
        detail: (key: string) => apiRequest(`/admin/cms/pages/${key}`, { auth: true }),
        update: (key: string, body: Record<string, unknown>) =>
          apiRequest(`/admin/cms/pages/${key}`, { method: "PATCH", auth: true, body }),
        delete: (key: string) => apiRequest(`/admin/cms/pages/${key}`, { method: "DELETE", auth: true }),
        addSection: (key: string, body: Record<string, unknown>) =>
          apiRequest(`/admin/cms/pages/${key}/sections`, { method: "POST", auth: true, body }),
        updateSection: (key: string, sectionId: string | number, body: Record<string, unknown>) =>
          apiRequest(`/admin/cms/pages/${key}/sections/${sectionId}`, { method: "PATCH", auth: true, body }),
        deleteSection: (key: string, sectionId: string | number) =>
          apiRequest(`/admin/cms/pages/${key}/sections/${sectionId}`, { method: "DELETE", auth: true }),
      },
      faqs: {
        list: () => apiRequest<any[]>("/admin/cms/faqs", { auth: true }),
        create: (body: Record<string, unknown>) =>
          apiRequest("/admin/cms/faqs", { method: "POST", auth: true, body }),
        update: (id: string | number, body: Record<string, unknown>) =>
          apiRequest(`/admin/cms/faqs/${id}`, { method: "PATCH", auth: true, body }),
        delete: (id: string | number) => apiRequest(`/admin/cms/faqs/${id}`, { method: "DELETE", auth: true }),
      },
      testimonials: {
        list: () => apiRequest<any[]>("/admin/cms/testimonials", { auth: true }),
        create: (body: FormData | Record<string, unknown>) =>
          apiRequest("/admin/cms/testimonials", { method: "POST", auth: true, body }),
        update: (id: string | number, body: FormData | Record<string, unknown>) =>
          apiRequest(`/admin/cms/testimonials/${id}`, { method: "PATCH", auth: true, body }),
        delete: (id: string | number) =>
          apiRequest(`/admin/cms/testimonials/${id}`, { method: "DELETE", auth: true }),
      },
      partners: {
        list: () => apiRequest<any[]>("/admin/cms/partners", { auth: true }),
        create: (body: FormData | Record<string, unknown>) =>
          apiRequest("/admin/cms/partners", { method: "POST", auth: true, body }),
        update: (id: string | number, body: FormData | Record<string, unknown>) =>
          apiRequest(`/admin/cms/partners/${id}`, { method: "PATCH", auth: true, body }),
        delete: (id: string | number) => apiRequest(`/admin/cms/partners/${id}`, { method: "DELETE", auth: true }),
      },
      settings: {
        list: () => apiRequest<any[]>("/admin/cms/settings", { auth: true }),
        update: (key: string, body: { value: unknown; is_public?: boolean }) =>
          apiRequest(`/admin/cms/settings/${key}`, { method: "PATCH", auth: true, body }),
      },
    },

    lookups: {
      list: (resource: string) => apiRequest(`/admin/lookups/${resource}`, { auth: true }),
      create: (resource: string, body: Record<string, unknown>) =>
        apiRequest(`/admin/lookups/${resource}`, { method: "POST", auth: true, body }),
      update: (resource: string, id: string | number, body: Record<string, unknown>) =>
        apiRequest(`/admin/lookups/${resource}/${id}`, { method: "PATCH", auth: true, body }),
      delete: (resource: string, id: string | number) =>
        apiRequest(`/admin/lookups/${resource}/${id}`, { method: "DELETE", auth: true }),
    },
  },
};

export async function fetchJson(path: string, options: ApiRequestOptions = {}) {
  return apiRequest(path, options);
}

export default {
  API_BASE_URL,
  API_ASSET_ORIGIN,
  API_FALLBACK_TO_LOCAL,
  api,
  apiFileRequest,
  apiRequest,
  buildApiUrl,
  clearStoredAuthToken,
  clearApiAuthState,
  fetchJson,
  getStoredAuthToken,
  resolveApiAssetUrl,
  setStoredAuthToken,
};
