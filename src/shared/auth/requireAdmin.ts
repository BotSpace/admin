import { NextResponse } from "next/server";
import { readSession, type SessionUser } from "@/shared/auth/session";

export function isAdminUser(user?: SessionUser | null): boolean {
  return Boolean(user && (user.is_staff || user.is_superuser));
}

/**
 * Guard for admin API route handlers. The middleware matcher excludes `/api`,
 * so every route under `src/app/api` must enforce the admin role itself.
 *
 * Returns a `NextResponse` (401/403) when access must be denied, or `null`
 * when the caller is an authenticated admin and the handler may proceed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }
  if (!isAdminUser(session.user)) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }
  return null;
}
