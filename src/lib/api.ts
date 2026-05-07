export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

type FetchOptions = RequestInit & { apiPath?: string };

export async function fetchJson(path: string, options: FetchOptions = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/+$/,'')}/${path.replace(/^\/+/, '')}`;
  const { apiPath, ...fetchOptions } = options;

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed (${res.status}): ${text}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export function buildApiUrl(path: string) {
  return path.startsWith("http") ? path : `${API_BASE_URL.replace(/\/+$/,'')}/${path.replace(/^\/+/, '')}`;
}

export default {
  API_BASE_URL,
  fetchJson,
  buildApiUrl,
};
