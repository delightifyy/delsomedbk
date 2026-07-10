// src/lib/api.ts
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
const USER_KEY = "carehub:api-user";
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

const VALIDATION_MESSAGE_LIMIT = 8;
const detailKeys = new Set(["message", "messages", "error", "errors", "detail", "details"]);
const directDetailKeys = ["errors", "details", "messages", "error", "detail", "message"];
const fieldKeys = new Set(["field", "attribute", "path", "param", "parameter", "name"]);

const humanizeErrorField = (field: string) => {
  const label = field
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter((part) => part && !/^\d+$/.test(part))
    .map((part) => part.replace(/[_-]+/g, " "))
    .join(" ")
    .trim();

  if (!label) return "";
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const firstApiString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const getDirectErrorDetail = (record: Record<string, unknown>) => {
  for (const key of directDetailKeys) {
    if (key in record) return record[key];
  }
  return undefined;
};

const collectApiErrorLines = (value: unknown, field?: string): string[] => {
  const prefix = (message: string) => {
    const clean = message.trim();
    const label = field ? humanizeErrorField(field) : "";
    return label && clean ? `${label}: ${clean}` : clean;
  };

  if (value === null || value === undefined || value === "") return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return [prefix(String(value))].filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectApiErrorLines(item, field));
  }
  if (typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const explicitField = firstApiString(
    record.field,
    record.attribute,
    record.path,
    record.param,
    record.parameter,
    record.name,
  );
  const nextField = explicitField || field;
  const directDetail = getDirectErrorDetail(record);
  const onlyDirectDetail = keys.every((key) => detailKeys.has(key) || fieldKeys.has(key));

  if (directDetail !== undefined && onlyDirectDetail) {
    return collectApiErrorLines(directDetail, nextField);
  }

  return Object.entries(record).flatMap(([key, child]) => {
    if (fieldKeys.has(key)) return [];
    if (detailKeys.has(key)) return collectApiErrorLines(child, nextField);
    return collectApiErrorLines(child, nextField ? `${nextField}.${key}` : key);
  });
};

export const formatApiErrorDetails = (errors: unknown, limit = VALIDATION_MESSAGE_LIMIT) => {
  const uniqueMessages = Array.from(
    new Set(collectApiErrorLines(errors).map((line) => line.trim()).filter(Boolean)),
  );
  if (!uniqueMessages.length) return "";

  const visible = uniqueMessages.slice(0, limit);
  const remaining = uniqueMessages.length - visible.length;
  return `${visible.join(" ")}${remaining > 0 ? ` ${remaining} more issue${remaining === 1 ? "" : "s"}.` : ""}`;
};

const composeApiErrorMessage = (message: string, errors?: unknown) => {
  const base = message.trim();
  const details = formatApiErrorDetails(errors);
  if (!details) return base;

  const lowerBase = base.toLowerCase();
  const lowerDetails = details.toLowerCase();
  if (lowerDetails.includes(lowerBase)) return details;
  if (lowerBase.includes(lowerDetails)) return base;
  if (/^(validation failed|the given data was invalid\.?|invalid data|unprocessable entity)$/i.test(base)) {
    return details;
  }

  return `${base}: ${details}`;
};

export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong.") => {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export class ApiError extends Error {
  status: number;
  errors: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(composeApiErrorMessage(message, errors));
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type AuthLoginPayload = {
  token: string;
  token_type?: string;
  expires_in?: number;
  user?: any;
  roles?: string[];
};

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

export const getStoredAuthUser = <T = any>() => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setStoredAuthUser = (user: unknown | null) => {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
};

export const clearApiAuthState = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const normalizeRoleList = (roles: unknown): string[] => {
  const source = Array.isArray(roles) ? roles : roles ? [roles] : [];
  return source
    .map((role) => {
      if (typeof role === "string") return role;
      if (role && typeof role === "object") {
        const record = role as Record<string, unknown>;
        return String(record.name ?? record.role ?? record.slug ?? record.key ?? "");
      }
      return "";
    })
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
};

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

export const extractAuthPayload = (response: unknown): AuthLoginPayload => {
  const root = response && typeof response === "object" ? response as Record<string, any> : {};
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, any> : {};
  const authorization =
    data.authorization && typeof data.authorization === "object"
      ? data.authorization
      : root.authorization && typeof root.authorization === "object"
        ? root.authorization
        : {};

  const token = firstString(
    data.token,
    data.access_token,
    data.plainTextToken,
    data.plain_text_token,
    authorization.token,
    authorization.access_token,
    root.token,
    root.access_token,
    root.plainTextToken,
    root.plain_text_token,
  );

  const user = data.user ?? data.doctor ?? root.user ?? root.doctor ?? null;
  const roles = normalizeRoleList(user?.roles ?? data.roles ?? root.roles);

  return {
    token,
    token_type: firstString(data.token_type, authorization.token_type, root.token_type) || undefined,
    expires_in: Number(data.expires_in ?? authorization.expires_in ?? root.expires_in) || undefined,
    user,
    roles,
  };
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
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const url = buildApiUrl(path, query);
    
    const response = await fetch(url, {
      ...requestOptions,
      headers: finalHeaders,
      body: finalBody,
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });

    clearTimeout(timeoutId);

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
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError("Request timeout - server is not responding. Please check your connection.", 408);
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError("Cannot connect to server.", 0);
    }
    throw error;
  }
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
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(buildApiUrl(path, query), {
      ...requestOptions,
      headers: finalHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError("File download timeout", 408);
    }
    throw error;
  }
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

    doctorOnboard: (body: { token: string; email: string; password: string; password_confirmation: string }) =>
      apiRequest("/auth/doctors/onboard", {
        method: "POST",
        body,
      }),
    
    // Doctor Login endpoint
    doctorLogin: (body: { email: string; password: string }) =>
      apiRequest<AuthLoginPayload | { access_token?: string; user?: any }>("/auth/doctors/login", {
        method: "POST",
        body,
      }),
    
    // Admin Login endpoint (for super_admin)
    adminLogin: (body: { email: string; password: string }) =>
      apiRequest<AuthLoginPayload | { access_token?: string; user?: any }>("/auth/admin/login", {
        method: "POST",
        body,
      }),

    doctorCmsLogin: (body: { email: string; password: string }) =>
      apiRequest<AuthLoginPayload | { access_token?: string; user?: any }>("/auth/doctors/cms/login", {
        method: "POST",
        body,
      }),
    
    forgotPassword: (email: string) => 
      apiRequest("/auth/password/forgot", { method: "POST", body: { email } }),
    
    resetPassword: (body: Record<string, unknown>) =>
      apiRequest("/auth/password/reset", { method: "POST", body }),
    
    resendVerification: () => 
      apiRequest("/auth/email/verify/resend", { method: "POST", auth: true }),
    
    me: () => 
      apiRequest("/auth/me", { auth: true }),
    
    refresh: () =>
      apiRequest<{ token: string; token_type: string; expires_in: number }>("/auth/refresh", {
        method: "POST",
        auth: true,
      }),
    
    logout: () => 
      apiRequest("/auth/logout", { method: "POST", auth: true }),
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
    availability: (uuid: string, query?: QueryParams) =>
      apiRequest(`/doctors/${uuid}/availability`, { query }),
    clinicLocations: (doctorUserUuid: string) =>
      apiRequest<{ data: any[] }>(`/doctors/${doctorUserUuid}/clinic-locations`, { auth: false }),
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

  medicare: {
    public: {
      listMiniSites: () => apiRequest<any[]>("/public/mini-sites"),
      bundle: (slug: string) => apiRequest(`/public/mini-sites/${slug}`),
      services: (slug: string) => apiRequest(`/public/mini-sites/${slug}/services`),
      contact: (slug: string) => apiRequest(`/public/mini-sites/${slug}/contact`),
      availability: (slug: string, query?: QueryParams) =>
        apiRequest(`/public/mini-sites/${slug}/availability`, { query }),
      posts: (slug: string, query?: QueryParams) =>
        apiRequest<any[]>(`/public/mini-sites/${slug}/posts`, { query }),
      post: (slug: string, postSlug: string) => apiRequest(`/public/mini-sites/${slug}/posts/${postSlug}`),
      clinicLocations: (miniSiteSlug: string) =>
        apiRequest<{ data: any[] }>(`/public/mini-sites/${miniSiteSlug}/clinic-locations`, { auth: false }),
      hmoProviders: (query?: { is_active?: boolean; page?: number; per_page?: number }) =>
        apiRequest<any[]>("/public/hmo-providers", { query }),
    },

    self: {
      bundle: () => apiRequest("/me/mini-site", { auth: true }),
      
      clinicLocations: {
        list: () => apiRequest<any[]>("/me/mini-site/clinic-locations", { auth: true }),
        create: (body: { name: string; address_line: string; city: string; phone?: string; is_active?: boolean }) =>
          apiRequest("/me/mini-site/clinic-locations", { method: "POST", auth: true, body }),
        update: (id: string, body: { name?: string; is_active?: boolean }) =>
          apiRequest(`/me/mini-site/clinic-locations/${id}`, { method: "PATCH", auth: true, body }),
        delete: (id: string) =>
          apiRequest(`/me/mini-site/clinic-locations/${id}`, { method: "DELETE", auth: true }),
      },
      
      hero: {
        show: () => apiRequest("/me/mini-site/hero", { auth: true }),
        update: (body: Record<string, unknown>) =>
          apiRequest("/me/mini-site/hero", { method: "PATCH", auth: true, body }),
      },
      about: {
        show: () => apiRequest("/me/mini-site/about", { auth: true }),
        update: (body: Record<string, unknown>) =>
          apiRequest("/me/mini-site/about", { method: "PATCH", auth: true, body }),
        uploadImage: (form: FormData) =>
          apiRequest("/me/mini-site/about/image", { method: "POST", auth: true, body: form }),
      },
      services: {
        show: () => apiRequest("/me/mini-site/services", { auth: true }),
        update: (body: Record<string, unknown>) =>
          apiRequest("/me/mini-site/services", { method: "PATCH", auth: true, body }),
        cards: {
          list: () => apiRequest<any[]>("/me/mini-site/services/cards", { auth: true }),
          create: (body: Record<string, unknown>) =>
            apiRequest("/me/mini-site/services/cards", { method: "POST", auth: true, body }),
          update: (cardId: string | number, body: Record<string, unknown>) =>
            apiRequest(`/me/mini-site/services/cards/${cardId}`, { method: "PATCH", auth: true, body }),
          delete: (cardId: string | number) =>
            apiRequest(`/me/mini-site/services/cards/${cardId}`, { method: "DELETE", auth: true }),
          reorder: (ids: Array<string | number>) =>
            apiRequest("/me/mini-site/services/cards/reorder", { method: "POST", auth: true, body: { ids } }),
          uploadImage: (cardId: string | number, form: FormData) =>
            apiRequest(`/me/mini-site/services/cards/${cardId}/image`, { method: "POST", auth: true, body: form }),
        },
      },
      contact: {
        show: () => apiRequest("/me/mini-site/contact", { auth: true }),
        update: (body: Record<string, unknown>) =>
          apiRequest("/me/mini-site/contact", { method: "PATCH", auth: true, body }),
      },
      footer: {
        show: () => apiRequest("/me/mini-site/footer", { auth: true }),
        update: (body: Record<string, unknown>) =>
          apiRequest("/me/mini-site/footer", { method: "PATCH", auth: true, body }),
        socialLinks: {
          list: () => apiRequest<any[]>("/me/mini-site/footer/social-links", { auth: true }),
          create: (body: Record<string, unknown>) =>
            apiRequest("/me/mini-site/footer/social-links", { method: "POST", auth: true, body }),
          update: (linkId: string | number, body: Record<string, unknown>) =>
            apiRequest(`/me/mini-site/footer/social-links/${linkId}`, { method: "PATCH", auth: true, body }),
          delete: (linkId: string | number) =>
            apiRequest(`/me/mini-site/footer/social-links/${linkId}`, { method: "DELETE", auth: true }),
        },
        links: {
          list: (query?: QueryParams) => apiRequest<any[]>("/me/mini-site/footer/links", { auth: true, query }),
          create: (body: Record<string, unknown>) =>
            apiRequest("/me/mini-site/footer/links", { method: "POST", auth: true, body }),
          update: (linkId: string | number, body: Record<string, unknown>) =>
            apiRequest(`/me/mini-site/footer/links/${linkId}`, { method: "PATCH", auth: true, body }),
          delete: (linkId: string | number) =>
            apiRequest(`/me/mini-site/footer/links/${linkId}`, { method: "DELETE", auth: true }),
        },
      },
      posts: {
        list: (query?: QueryParams) => apiRequest<any[]>("/me/mini-site/posts", { auth: true, query }),
        create: (body: Record<string, unknown> | FormData) =>
          apiRequest("/me/mini-site/posts", { method: "POST", auth: true, body }),
        detail: (postId: string | number) => apiRequest(`/me/mini-site/posts/${postId}`, { auth: true }),
        update: (postId: string | number, body: Record<string, unknown> | FormData) =>
          apiRequest(`/me/mini-site/posts/${postId}`, { method: "PATCH", auth: true, body }),
        delete: (postId: string | number) =>
          apiRequest(`/me/mini-site/posts/${postId}`, { method: "DELETE", auth: true }),
        uploadCover: (postId: string | number, form: FormData) =>
          apiRequest(`/me/mini-site/posts/${postId}/cover`, { method: "POST", auth: true, body: form }),
      },
      availability: {
        bundle: () => apiRequest("/me/mini-site/availability", { auth: true }),
        settings: {
          show: () => apiRequest("/me/mini-site/availability/settings", { auth: true }),
          update: (body: Record<string, unknown>) =>
            apiRequest("/me/mini-site/availability/settings", { method: "PATCH", auth: true, body }),
        },
        weeklyWindows: {
          list: (query?: QueryParams) =>
            apiRequest<any[]>("/me/mini-site/availability/weekly-windows", { auth: true, query }),
          create: (body: Record<string, unknown>) =>
            apiRequest("/me/mini-site/availability/weekly-windows", { method: "POST", auth: true, body }),
          update: (windowId: string | number, body: Record<string, unknown>) =>
            apiRequest(`/me/mini-site/availability/weekly-windows/${windowId}`, { method: "PATCH", auth: true, body }),
          delete: (windowId: string | number) =>
            apiRequest(`/me/mini-site/availability/weekly-windows/${windowId}`, { method: "DELETE", auth: true }),
        },
        exceptions: {
          list: (query?: QueryParams) =>
            apiRequest<any[]>("/me/mini-site/availability/exceptions", { auth: true, query }),
          create: (body: Record<string, unknown>) =>
            apiRequest("/me/mini-site/availability/exceptions", { method: "POST", auth: true, body }),
          update: (exceptionId: string | number, body: Record<string, unknown>) =>
            apiRequest(`/me/mini-site/availability/exceptions/${exceptionId}`, { method: "PATCH", auth: true, body }),
          delete: (exceptionId: string | number) =>
            apiRequest(`/me/mini-site/availability/exceptions/${exceptionId}`, { method: "DELETE", auth: true }),
        },
      },
    },
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
    
    patient: {
      profile: () => apiRequest("/me/patient/profile", { auth: true }),
      updateProfile: (body: { 
        first_name?: string; 
        address?: string; 
        blood_type?: string; 
        next_of_kin?: {
          full_name: string;
          phone: string;
          relationship: string;
        }
      }) => apiRequest("/me/patient/profile", { method: "PATCH", auth: true, body }),
      
      changePassword: (body: {
        current_password: string;
        password: string;
        password_confirmation: string;
      }) => apiRequest("/me/patient/password", { method: "POST", auth: true, body }),
      
      notificationPreferences: (body: { marketing_emails?: boolean }) =>
        apiRequest("/me/patient/notification-preferences", { method: "PATCH", auth: true, body }),
      
      securityPreferences: (body: { two_factor_enabled?: boolean }) =>
        apiRequest("/me/patient/security-preferences", { method: "PATCH", auth: true, body }),
    },

    dashboard: () => apiRequest<{
      upcoming_appointments: any[];
      recent_consultations: any[];
      health_snapshot: {
        blood_type: string;
        allergies: string[];
        chronic_conditions: string[];
      };
      stats: {
        upcoming: number;
        past_visits: number;
        prescriptions: number;
      };
    }>("/me/dashboard", { auth: true }),

    paymentCategory: () => apiRequest<{
      category: "card" | "hmo" | "subscription" | "organization";
      details: any;
    }>("/me/payment-category", { auth: true }),

    switchPaymentCategory: (body: { category: string }) =>
      apiRequest("/me/payment-category/switch", { method: "POST", auth: true, body }),

    consultations: {
      list: (query?: { 
        search?: string; 
        type?: string; 
        date_from?: string; 
        date_to?: string;
        page?: number;
        per_page?: number;
      }) => apiRequest<any[], PaginationMeta>("/me/consultations", { auth: true, query }),
      
      detail: (consultationUuid: string) => 
        apiRequest(`/me/consultations/${consultationUuid}`, { auth: true }),
      
      downloadSummary: (consultationUuid: string) =>
        apiFileRequest(`/me/consultations/${consultationUuid}/summary`, { auth: true }),
    },

    prescriptions: {
      list: (query?: { status?: "active" | "expired" | "completed" | "cancelled"; page?: number; per_page?: number }) =>
        apiRequest<any[], PaginationMeta>("/me/prescriptions", { auth: true, query }),
      
      detail: (prescriptionUuid: string) =>
        apiRequest(`/me/prescriptions/${prescriptionUuid}`, { auth: true }),
      
      download: (prescriptionUuid: string) =>
        apiFileRequest(`/me/prescriptions/${prescriptionUuid}/download`, { auth: true }),
      
      requestRefill: (prescriptionUuid: string, body?: { note?: string }) =>
        apiRequest(`/me/prescriptions/${prescriptionUuid}/refill-requests`, { method: "POST", auth: true, body }),
    },

    subscriptions: {
      list: (query?: { status?: "active" | "expired" | "cancelled" | "pending" }) =>
        apiRequest<any[]>("/me/subscriptions", { auth: true, query }),
      
      renew: (dsmId: string, body?: { billing_period?: "monthly" | "quarterly" | "yearly" }) =>
        apiRequest(`/me/subscriptions/${dsmId}/renew`, { method: "POST", auth: true, body }),
      
      upgrade: (body: { subscription_package_id: string }) =>
        apiRequest("/me/subscriptions/upgrade", { method: "POST", auth: true, body }),
    },

    coverage: {
      hmo: {
        get: () => apiRequest("/me/coverage/hmo", { auth: true }),
        submit: (body: {
          provider_id: string;
          policy_number: string;
          member_name: string;
          member_dob?: string;
        }) => apiRequest("/me/coverage/hmo", { method: "POST", auth: true, body }),
      },
      organization: {
        get: () => apiRequest("/me/coverage/organization", { auth: true }),
        submit: (body: {
          company_name: string;
          employee_id: string;
          department?: string;
        }) => apiRequest("/me/coverage/organization", { method: "POST", auth: true, body }),
      },
    },
    
    appointments: {
      create: (body: {
        service_card_id: string;
        slot_date: string;
        slot_start_time: string;
        access_method: "card" | "subscription" | "hmo" | "organization";
        consents: string[];
        access_method_payload?: {
          subscription_id?: string;
          hmo_provider_id?: string;
          policy_number?: string;
          member_name?: string;
          member_dob?: string;
          organization_id?: string;
          staff_id?: string;
          letter_path?: string;
        };
        clinic_location_id?: string;
        appointment_type?: "physical" | "online";
        doctor_user_uuid?: string;
        mini_site_slug?: string;
      }) => apiRequest<{ data: { reference: string; appointment_id: string; status: string } }>(
        "/me/appointments", 
        { method: "POST", auth: true, body }
      ),
      
      list: (query?: { 
        status?: "pending" | "confirmed" | "cancelled" | "completed" | "awaiting_verification" | "verified" | "rejected";
        page?: number; 
        per_page?: number 
      }) => 
        apiRequest<{ data: any[]; meta: PaginationMeta }>("/me/appointments", { auth: true, query }),
      
      detail: (appointmentUuid: string) => 
        apiRequest<{ data: any }>(`/me/appointments/${appointmentUuid}`, { auth: true }),
      
      cancel: (appointmentUuid: string, reason?: string) => 
        apiRequest(`/me/appointments/${appointmentUuid}/cancel`, { 
          method: "POST", 
          auth: true, 
          body: reason ? { reason } : undefined 
        }),
      
      reschedule: (appointmentUuid: string, body: { 
        slot_date: string; 
        slot_start_time: string; 
        location_id?: string 
      }) => 
        apiRequest(`/me/appointments/${appointmentUuid}/reschedule`, { 
          method: "POST", 
          auth: true, 
          body 
        }),
      
      uploadLetter: (formData: FormData) => 
        apiRequest<{ url: string; file_url: string }>("/me/appointments/upload-letter", { 
          method: "POST", 
          auth: true, 
          body: formData 
        }),
    },
    
    uploads: {
      file: (form: FormData) =>
        apiRequest<{ url: string }>("/me/uploads", { method: "POST", auth: true, body: form }),
    },
  },

  doctorPortal: {
    catalog: () => apiRequest("/clinical-catalog"),

    dashboard: () => apiRequest("/me/doctor/dashboard", { auth: true }),

    schedule: (query?: { week_of?: string }) =>
      apiRequest("/me/doctor/schedule", { auth: true, query }),

    appointments: {
      list: (query?: {
        status?: "confirmed" | "pending" | "completed" | "cancelled" | "no_show" | string;
        page?: number;
        per_page?: number;
      }) => apiRequest("/me/doctor/appointments", { auth: true, query }),

      detail: (appointmentUuid: string) =>
        apiRequest(`/me/doctor/appointments/${appointmentUuid}`, { auth: true }),

      complete: (appointmentUuid: string, body: {
        type?: string;
        diagnosis?: string;
        reason_for_visit?: string;
        clinical_notes?: string;
        summary?: string;
      }) =>
        apiRequest(`/me/doctor/appointments/${appointmentUuid}/complete`, {
          method: "POST",
          auth: true,
          body,
        }),

      noShow: (appointmentUuid: string) =>
        apiRequest(`/me/doctor/appointments/${appointmentUuid}/no-show`, {
          method: "POST",
          auth: true,
        }),
    },

    consultations: {
      detail: (consultationUuid: string) =>
        apiRequest(`/me/doctor/consultations/${consultationUuid}`, { auth: true }),

      saveClinicalNotes: (consultationUuid: string, body: Record<string, unknown>) =>
        apiRequest(`/me/doctor/consultations/${consultationUuid}/clinical-notes`, {
          method: "PATCH",
          auth: true,
          body,
        }),

      createPrescription: (consultationUuid: string, body: Record<string, unknown>) =>
        apiRequest(`/me/doctor/consultations/${consultationUuid}/prescription-documents`, {
          method: "POST",
          auth: true,
          body,
        }),

      createLabRequisition: (consultationUuid: string, body: Record<string, unknown>) =>
        apiRequest(`/me/doctor/consultations/${consultationUuid}/lab-requisitions`, {
          method: "POST",
          auth: true,
          body,
        }),

      createDiagnosticRequest: (consultationUuid: string, body: Record<string, unknown>) =>
        apiRequest(`/me/doctor/consultations/${consultationUuid}/diagnostic-requests`, {
          method: "POST",
          auth: true,
          body,
        }),

      createReferral: (consultationUuid: string, body: Record<string, unknown>) =>
        apiRequest(`/me/doctor/consultations/${consultationUuid}/referrals`, {
          method: "POST",
          auth: true,
          body,
        }),
    },

    requisitions: {
      prescriptionPdf: (prescriptionDocUuid: string) =>
        apiFileRequest(`/me/doctor/requisitions/prescription-documents/${prescriptionDocUuid}/pdf`, { auth: true }),
      labPdf: (labUuid: string) =>
        apiFileRequest(`/me/doctor/requisitions/lab-requisitions/${labUuid}/pdf`, { auth: true }),
      diagnosticPdf: (imagingUuid: string) =>
        apiFileRequest(`/me/doctor/requisitions/diagnostic-requests/${imagingUuid}/pdf`, { auth: true }),
      referralPdf: (referralUuid: string) =>
        apiFileRequest(`/me/doctor/requisitions/referrals/${referralUuid}/pdf`, { auth: true }),
    },

    patients: {
      list: (query?: { search?: string; page?: number; per_page?: number }) =>
        apiRequest("/me/doctor/patients", { auth: true, query }),
      detail: (patientUserUuid: string) =>
        apiRequest(`/me/doctor/patients/${patientUserUuid}`, { auth: true }),
    },

    investigations: {
      list: (query?: { status?: string; kind?: "lab" | "imaging" | string; page?: number; per_page?: number }) =>
        apiRequest("/me/doctor/investigations", { auth: true, query }),
      lab: (labUuid: string) =>
        apiRequest(`/me/doctor/investigations/lab/${labUuid}`, { auth: true }),
      imaging: (imagingUuid: string) =>
        apiRequest(`/me/doctor/investigations/imaging/${imagingUuid}`, { auth: true }),
      updateLabStatus: (labUuid: string, status: string) =>
        apiRequest(`/me/doctor/investigations/lab/${labUuid}/status`, {
          method: "PATCH",
          auth: true,
          body: { status },
        }),
      updateImagingStatus: (imagingUuid: string, status: string) =>
        apiRequest(`/me/doctor/investigations/imaging/${imagingUuid}/status`, {
          method: "PATCH",
          auth: true,
          body: { status },
        }),
    },

    settings: {
      get: () => apiRequest("/me/doctor/settings", { auth: true }),
      update: (body: Record<string, unknown>) =>
        apiRequest("/me/doctor/settings", { method: "PATCH", auth: true, body }),
      uploadSignature: (form: FormData) =>
        apiRequest("/me/doctor/settings/signature", { method: "POST", auth: true, body: form }),
    },

    payments: {
      overview: () => apiRequest("/me/doctor/payments/overview", { auth: true }),
      earnings: (query?: { type?: string; from?: string; to?: string; page?: number; per_page?: number }) =>
        apiRequest("/me/doctor/payments/earnings", { auth: true, query }),
      earningsExport: (query?: QueryParams) =>
        apiFileRequest("/me/doctor/payments/earnings/export", { auth: true, query }),
      referrals: (query?: { page?: number; per_page?: number }) =>
        apiRequest("/me/doctor/payments/referrals", { auth: true, query }),
      payouts: (query?: { page?: number; per_page?: number }) =>
        apiRequest("/me/doctor/payments/payouts", { auth: true, query }),
      reconciliation: {
        list: (query?: { status?: string; page?: number; per_page?: number }) =>
          apiRequest("/me/doctor/payments/reconciliation", { auth: true, query }),
        submit: (body: { expected_amount_kobo: number; reason: string; details?: string }) =>
          apiRequest("/me/doctor/payments/reconciliation", {
            method: "POST",
            auth: true,
            body,
          }),
      },
    },
  },

  admin: {
    applications: {
      list: (query?: QueryParams) => apiRequest<any[], PaginationMeta>("/admin/applications", { auth: true, query }),
      detail: (uuid: string) => apiRequest(`/admin/applications/${uuid}`, { auth: true }),
      approve: (uuid: string, note?: string) =>
        apiRequest<{ user_uuid: string }>(`/admin/applications/${uuid}/approve`, { method: "POST", auth: true, body: { note } }),
      reject: (uuid: string, reason: string) =>
        apiRequest(`/admin/applications/${uuid}/reject`, { method: "POST", auth: true, body: { reason } }),
      note: (uuid: string, note: string) =>
        apiRequest(`/admin/applications/${uuid}/notes`, { method: "POST", auth: true, body: { note } }),
      downloadDocument: (uuid: string, documentId: number | string) =>
        apiFileRequest(`/admin/applications/${uuid}/documents/${documentId}/download`, { auth: true }),
      documentUrl: (uuid: string, documentId: number | string) =>
        buildApiUrl(`/admin/applications/${uuid}/documents/${documentId}/download`),
    },

    doctors: {
      miniSite: (userUuid: string) =>
        apiRequest<{
          id: number;
          slug: string;
          public_url: string;
          admin_url: string;
          status: string;
          generated_at: string;
          generated_by?: { uuid: string; name: string } | null;
          regenerated_from?: string | null;
          regenerated_at?: string | null;
          regenerated_by?: { uuid: string; name: string } | null;
        }>(`/admin/doctors/${userUuid}/mini-site`, { auth: true }),
      regenerateMiniSite: (userUuid: string) =>
        apiRequest<{
          id: number;
          slug: string;
          public_url: string;
          admin_url: string;
          status: string;
          generated_at: string;
          generated_by?: { uuid: string; name: string } | null;
          regenerated_from?: string | null;
          regenerated_at?: string | null;
          regenerated_by?: { uuid: string; name: string } | null;
        }>(`/admin/doctors/${userUuid}/mini-site/regenerate`, { method: "POST", auth: true }),
    },

    payments: {
      rates: {
        get: () => apiRequest("/admin/payments/rates", { auth: true }),
        update: (body: Record<string, unknown>) =>
          apiRequest("/admin/payments/rates", { method: "PATCH", auth: true, body }),
      },
      hmoRates: {
        list: () => apiRequest<any[]>("/admin/payments/hmo-rates", { auth: true }),
        update: (hmoProviderId: string | number, body: { amount_kobo?: number; is_active?: boolean }) =>
          apiRequest(`/admin/payments/hmo-rates/${hmoProviderId}`, {
            method: "PUT",
            auth: true,
            body,
          }),
      },
      partnerRates: {
        update: (
          type: "pharmacy" | "diagnostic" | "doctor" | string,
          userUuid: string,
          body: { referral_commission_kobo: number },
        ) =>
          apiRequest(`/admin/payments/partner-rates/${type}/${userUuid}`, {
            method: "PUT",
            auth: true,
            body,
          }),
      },
      doctorPayouts: {
        list: (doctorUserUuid: string, query?: QueryParams) =>
          apiRequest(`/admin/payments/doctors/${doctorUserUuid}/payouts`, { auth: true, query }),
        create: (doctorUserUuid: string, body: Record<string, unknown>) =>
          apiRequest(`/admin/payments/doctors/${doctorUserUuid}/payouts`, {
            method: "POST",
            auth: true,
            body,
          }),
      },
      reconciliation: {
        list: (query?: { status?: string; page?: number; per_page?: number }) =>
          apiRequest("/admin/payments/reconciliation", { auth: true, query }),
        resolve: (reconciliationUuid: string, resolution_note: string) =>
          apiRequest(`/admin/payments/reconciliation/${reconciliationUuid}/resolve`, {
            method: "POST",
            auth: true,
            body: { resolution_note },
          }),
        reject: (reconciliationUuid: string, resolution_note: string) =>
          apiRequest(`/admin/payments/reconciliation/${reconciliationUuid}/reject`, {
            method: "POST",
            auth: true,
            body: { resolution_note },
          }),
      },
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

    appointments: {
      list: (query?: { 
        page?: number; 
        per_page?: number;
        status?: "pending" | "awaiting_verification" | "verified" | "rejected" | "completed" | "confirmed";
        access_method?: "card" | "subscription" | "hmo" | "organization";
        doctor_uuid?: string;
        from?: string;
        to?: string;
      }) => 
        apiRequest<any[], PaginationMeta>("/admin/appointments", { auth: true, query }),
      
      detail: (appointmentUuid: string) => 
        apiRequest<{ data: any }>(`/admin/appointments/${appointmentUuid}`, { auth: true }),
      
      verify: (appointmentUuid: string) => 
        apiRequest(`/admin/appointments/${appointmentUuid}/verify`, { 
          method: "POST", 
          auth: true 
        }),
      
      reject: (appointmentUuid: string, body?: { reason?: string }) => 
        apiRequest(`/admin/appointments/${appointmentUuid}/reject-verification`, { 
          method: "POST", 
          auth: true, 
          body 
        }),
    },

    coverage: {
      hmo: {
        list: (query?: { status?: string; page?: number; per_page?: number }) =>
          apiRequest<any[], PaginationMeta>("/admin/coverage/hmo", { auth: true, query }),
        verify: (enrollmentUuid: string) =>
          apiRequest(`/admin/coverage/hmo/${enrollmentUuid}/verify`, { method: "POST", auth: true }),
        reject: (enrollmentUuid: string, body: { reason: string }) =>
          apiRequest(`/admin/coverage/hmo/${enrollmentUuid}/reject`, { method: "POST", auth: true, body }),
      },
      organization: {
        list: (query?: { status?: string; page?: number; per_page?: number }) =>
          apiRequest<any[], PaginationMeta>("/admin/coverage/organization", { auth: true, query }),
        verify: (membershipUuid: string) =>
          apiRequest(`/admin/coverage/organization/${membershipUuid}/verify`, { method: "POST", auth: true }),
        reject: (membershipUuid: string, body: { reason: string }) =>
          apiRequest(`/admin/coverage/organization/${membershipUuid}/reject`, { method: "POST", auth: true, body }),
      },
    },

    hmoProviders: {
      list: (query?: { 
        page?: number; 
        per_page?: number;
        search?: string;
        is_active?: boolean;
      }) => 
        apiRequest<any[], PaginationMeta>("/admin/hmo-providers", { auth: true, query }),
      
      create: (body: { 
        name: string; 
        code: string; 
        is_active?: boolean;
      }) => 
        apiRequest("/admin/hmo-providers", { 
          method: "POST", 
          auth: true, 
          body 
        }),
      
      detail: (hmoProviderId: string | number) => 
        apiRequest(`/admin/hmo-providers/${hmoProviderId}`, { auth: true }),
      
      update: (hmoProviderId: string | number, body: { 
        name?: string; 
        code?: string; 
        is_active?: boolean;
      }) => 
        apiRequest(`/admin/hmo-providers/${hmoProviderId}`, { 
          method: "PATCH", 
          auth: true, 
          body 
        }),
      
      delete: (hmoProviderId: string | number) => 
        apiRequest(`/admin/hmo-providers/${hmoProviderId}`, { 
          method: "DELETE", 
          auth: true 
        }),
      
      reorder: (body: { ids: (string | number)[] }) => 
        apiRequest("/admin/hmo-providers/reorder", { 
          method: "POST", 
          auth: true, 
          body 
        }),
    },

    subscriptionPackages: {
      list: (query?: { 
        type?: "individual" | "family" | "corporate" | "custom";
        billing_period?: "monthly" | "quarterly" | "yearly";
        search?: string;
        page?: number; 
        per_page?: number;
        is_active?: boolean;
      }) => 
        apiRequest<any[], PaginationMeta>("/admin/subscription-packages", { auth: true, query }),
      
      detail: (subscriptionPackageId: string | number) => 
        apiRequest<any>(`/admin/subscription-packages/${subscriptionPackageId}`, { auth: true }),
      
      create: (body: { 
        name: string;
        type: "individual" | "family" | "corporate" | "custom";
        description: string;
        price_kobo: number;
        billing_period: "monthly" | "quarterly" | "yearly";
        consultations_included: number;
        features: string[];
        is_active?: boolean;
      }) => 
        apiRequest("/admin/subscription-packages", { 
          method: "POST", 
          auth: true, 
          body 
        }),
      
      update: (subscriptionPackageId: string | number, body: { 
        name?: string;
        type?: "individual" | "family" | "corporate" | "custom";
        description?: string;
        price_kobo?: number;
        billing_period?: "monthly" | "quarterly" | "yearly";
        consultations_included?: number;
        features?: string[];
        is_active?: boolean;
      }) => 
        apiRequest(`/admin/subscription-packages/${subscriptionPackageId}`, { 
          method: "PATCH", 
          auth: true, 
          body 
        }),
      
      delete: (subscriptionPackageId: string | number) => 
        apiRequest(`/admin/subscription-packages/${subscriptionPackageId}`, { 
          method: "DELETE", 
          auth: true 
        }),
      
      reorder: (body: { ids: (string | number)[] }) => 
        apiRequest("/admin/subscription-packages/reorder", { 
          method: "POST", 
          auth: true, 
          body 
        }),
      
      subscribers: (subscriptionPackageId: string | number, query?: { 
        page?: number; 
        per_page?: number;
        status?: "active" | "expired" | "cancelled";
      }) => 
        apiRequest<any[], PaginationMeta>(`/admin/subscription-packages/${subscriptionPackageId}/subscribers`, { 
          auth: true, 
          query 
        }),
    },

    patientSubscriptions: {
      list: (query?: { 
        page?: number; 
        per_page?: number;
        search?: string;
        package_id?: string;
        status?: "active" | "expired" | "cancelled" | "pending";
        from_date?: string;
        to_date?: string;
      }) => 
        apiRequest<any[], PaginationMeta>("/admin/patient-subscriptions", { auth: true, query }),
      
      detail: (dsmId: string) => 
        apiRequest<any>(`/admin/patient-subscriptions/${dsmId}`, { auth: true }),
      
      cancel: (dsmId: string, body?: { reason?: string }) => 
        apiRequest(`/admin/patient-subscriptions/${dsmId}/cancel`, { 
          method: "POST", 
          auth: true, 
          body 
        }),
      
      renew: (dsmId: string, body?: { 
        billing_period?: "monthly" | "quarterly" | "yearly";
        start_date?: string;
      }) => 
        apiRequest(`/admin/patient-subscriptions/${dsmId}/renew`, { 
          method: "POST", 
          auth: true, 
          body 
        }),
      
      history: (dsmId: string, query?: { 
        page?: number; 
        per_page?: number;
      }) => 
        apiRequest<any[], PaginationMeta>(`/admin/patient-subscriptions/${dsmId}/history`, { 
          auth: true, 
          query 
        }),
      
      export: (query?: { 
        package_id?: string;
        status?: string;
        from_date?: string;
        to_date?: string;
      }) => 
        apiFileRequest("/admin/patient-subscriptions/export", { 
          auth: true, 
          query 
        }),
    },

    subscribers: {
      list: (query?: { 
        page?: number; 
        per_page?: number;
        search?: string;
        package_id?: string;
        status?: "active" | "expired" | "cancelled" | "pending";
        from_date?: string;
        to_date?: string;
      }) => 
        apiRequest<any[], PaginationMeta>("/admin/subscribers", { auth: true, query }),
      
      detail: (subscriberId: string | number) => 
        apiRequest<any>(`/admin/subscribers/${subscriberId}`, { auth: true }),
      
      update: (subscriberId: string | number, body: { 
        status?: "active" | "expired" | "cancelled" | "pending";
        auto_renew?: boolean;
        notes?: string;
      }) => 
        apiRequest(`/admin/subscribers/${subscriberId}`, { 
          method: "PATCH", 
          auth: true, 
          body 
        }),
      
      cancel: (subscriberId: string | number, body?: { reason?: string }) => 
        apiRequest(`/admin/subscribers/${subscriberId}/cancel`, { 
          method: "POST", 
          auth: true, 
          body 
        }),
      
      renew: (subscriberId: string | number, body?: { 
        billing_period?: "monthly" | "quarterly" | "yearly";
        start_date?: string;
      }) => 
        apiRequest(`/admin/subscribers/${subscriberId}/renew`, { 
          method: "POST", 
          auth: true, 
          body 
        }),
      
      history: (subscriberId: string | number, query?: { 
        page?: number; 
        per_page?: number;
      }) => 
        apiRequest<any[], PaginationMeta>(`/admin/subscribers/${subscriberId}/history`, { 
          auth: true, 
          query 
        }),
      
      export: (query?: { 
        package_id?: string;
        status?: string;
        from_date?: string;
        to_date?: string;
      }) => 
        apiFileRequest("/admin/subscribers/export", { 
          auth: true, 
          query 
        }),
    },
  },
};

export const publicApi = {
  hmoProviders: (query?: { is_active?: boolean; page?: number; per_page?: number }) =>
    apiRequest<any[]>("/public/hmo-providers", { query }),
  partners: () => api.cms.partners(),
  subscriptionPackages: (query?: { is_active?: boolean; type?: string }) =>
    apiRequest<any[]>("/public/subscription-packages", { query }),
};

export async function fetchJson(path: string, options: ApiRequestOptions = {}) {
  return apiRequest(path, options);
}

export default {
  API_BASE_URL,
  API_ASSET_ORIGIN,
  API_FALLBACK_TO_LOCAL,
  api,
  publicApi,
  apiFileRequest,
  apiRequest,
  buildApiUrl,
  clearStoredAuthToken,
  clearApiAuthState,
  extractAuthPayload,
  fetchJson,
  getStoredAuthUser,
  getStoredAuthToken,
  normalizeRoleList,
  resolveApiAssetUrl,
  setStoredAuthUser,
  setStoredAuthToken,
};
