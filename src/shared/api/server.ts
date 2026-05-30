import "server-only";
import { apiFetch, type ApiOptions } from "./client";
import { readSession } from "@/shared/auth/session";

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const session = await readSession();
  if (!session) return apiFetch<T>(path, { ...opts, skipAuth: true });
  return apiFetch<T>(path, { ...opts, token: session.access });
}

export { apiFetch };
