import { env } from "@/shared/lib/env";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export type ApiOptions = RequestInit & {
  token?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  skipAuth?: boolean;
};

// All call sites hardcode paths as "/api/v1/...". Rewrite that leading
// segment to NEXT_PUBLIC_API_PREFIX so prod can point at the gateway's
// "/api/v2" (-> new Go backend) without touching every call site, while
// localhost dev keeps hitting the backend's real "/api/v1" unchanged.
export function applyApiPrefix(path: string): string {
  const prefix = env.NEXT_PUBLIC_API_PREFIX;
  if (prefix === "/api/v1") return path;
  if (path === "/api/v1" || path.startsWith("/api/v1/")) {
    return prefix + path.slice("/api/v1".length);
  }
  return path;
}

function buildUrl(path: string, query?: ApiOptions["query"]): string {
  const root = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const prefixed = applyApiPrefix(path);
  const full = prefixed.startsWith("/") ? root + prefixed : root + "/" + prefixed;
  if (!query) return full;
  const url = new URL(full);
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { token, query, json, headers, skipAuth, ...rest } = opts;
  const url = buildUrl(path, query);

  const h = new Headers(headers ?? {});
  if (json !== undefined && !h.has("content-type")) h.set("content-type", "application/json");
  if (!skipAuth && token) h.set("authorization", `Bearer ${token}`);
  if (!h.has("accept")) h.set("accept", "application/json");

  const init: RequestInit = {
    ...rest,
    headers: h,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: rest.cache ?? "no-store",
  };

  const res = await fetch(url, init);
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: extractMessage(data) || res.statusText || "Request failed",
      details: data,
    };
    throw err;
  }
  return data as T;
}

// New Go backend error envelope: { error: { code, message, details } }.
function extractMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  const err = d["error"];
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e["message"] === "string") return e["message"];
    if (typeof e["code"] === "string") return e["code"];
  }
  for (const key of ["detail", "message"]) {
    const v = d[key];
    if (typeof v === "string") return v;
  }
  return undefined;
}

/** Machine-readable error code from the new backend's {error:{code,...}} envelope. */
export function apiErrorCode(e: unknown): string | undefined {
  if (!e || typeof e !== "object") return undefined;
  const details = (e as ApiError).details;
  if (!details || typeof details !== "object") return undefined;
  const err = (details as Record<string, unknown>)["error"];
  if (err && typeof err === "object") {
    const code = (err as Record<string, unknown>)["code"];
    if (typeof code === "string") return code;
  }
  return undefined;
}

export function isApiError(e: unknown): e is ApiError {
  return Boolean(e && typeof e === "object" && "status" in e && "message" in e);
}
