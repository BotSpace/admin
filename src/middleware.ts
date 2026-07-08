import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/shared/lib/env";
import { REFRESH_TOKEN_TTL_SEC } from "@/shared/lib/constants";

const sessionSecret = () => new TextEncoder().encode(env.SESSION_SECRET);

// Everything in the admin is protected — there is no public-facing area.
// The only exclusion is Next internals and static assets.
const REFRESH_BUFFER_SEC = 60;

type SessionPayload = {
  access: string;
  refresh: string;
  user: Record<string, unknown>;
};

function decodeAccessExp(access: string): number | null {
  try {
    const parts = access.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

async function refreshTokens(
  refresh: string
): Promise<{ access: string; refresh: string } | null> {
  try {
    // New Go backend: POST /api/v1/auth/refresh {refresh_token} → flat
    // {access_token, refresh_token, ...} — no nested data/token envelope.
    // NEXT_PUBLIC_API_PREFIX lets prod rewrite this to /api/v2 (gateway ->
    // new Go backend) while localhost keeps hitting /api/v1 directly.
    const url =
      env.NEXT_PUBLIC_API_URL.replace(/\/$/, "") + env.NEXT_PUBLIC_API_PREFIX + "/auth/refresh";
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { access_token?: string; refresh_token?: string };
    if (!data.access_token) return null;
    return { access: data.access_token, refresh: data.refresh_token ?? refresh };
  } catch {
    return null;
  }
}

async function encodeSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_SEC}s`)
    .sign(sessionSecret());
}

type SessionState =
  | { kind: "none" }
  | { kind: "valid"; session: SessionPayload }
  | { kind: "refreshed"; session: SessionPayload; cookie: string }
  | { kind: "broken" };

async function loadSession(cookieValue: string | undefined): Promise<SessionState> {
  if (!cookieValue) return { kind: "none" };

  let payload: SessionPayload;
  try {
    const { payload: p } = await jwtVerify(cookieValue, sessionSecret());
    payload = p as unknown as SessionPayload;
  } catch {
    return { kind: "broken" };
  }
  if (!payload?.access || !payload?.refresh) return { kind: "broken" };

  const exp = decodeAccessExp(payload.access);
  const now = Math.floor(Date.now() / 1000);
  const accessAlreadyExpired = exp !== null && exp <= now;
  const needsRefresh = exp === null || exp - now <= REFRESH_BUFFER_SEC;
  if (!needsRefresh) return { kind: "valid", session: payload };

  const next = await refreshTokens(payload.refresh);
  if (!next) {
    if (accessAlreadyExpired) return { kind: "broken" };
    return { kind: "valid", session: payload };
  }

  const refreshed: SessionPayload = { ...payload, ...next };
  const cookie = await encodeSession(refreshed);
  return { kind: "refreshed", session: refreshed, cookie };
}

function applySessionCookie(response: NextResponse, value: string) {
  response.cookies.set(env.SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SEC,
    ...(env.SESSION_COOKIE_DOMAIN ? { domain: env.SESSION_COOKIE_DOMAIN } : {}),
  });
}

function clearSessionCookie(response: NextResponse) {
  if (env.SESSION_COOKIE_DOMAIN) {
    response.cookies.set(env.SESSION_COOKIE_NAME, "", {
      maxAge: 0,
      path: "/",
      domain: env.SESSION_COOKIE_DOMAIN,
    });
    return;
  }
  response.cookies.delete(env.SESSION_COOKIE_NAME);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  const cookieValue = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;
  const state = await loadSession(cookieValue);

  // Forward refreshed cookie value so downstream RSC reads the new tokens.
  if (state.kind === "refreshed") {
    request.cookies.set(env.SESSION_COOKIE_NAME, state.cookie);
  }

  const isAuthed = state.kind === "valid" || state.kind === "refreshed";

  if (!isAuthed) {
    // This admin app now ships its own /login page (src/app/login) that
    // authenticates directly against the new Go backend, so unauthenticated
    // requests are sent there instead of the separate dashboard app.
    const loginUrl = new URL("/login", request.url);
    const redirect = NextResponse.redirect(loginUrl);
    if (state.kind === "broken") clearSessionCookie(redirect);
    return redirect;
  }

  // Authenticated is not enough — the admin app is staff-only. Reject any
  // logged-in user who is not staff/superuser. The role travels inside the
  // signed session cookie (SessionUser), so no extra API call is needed.
  const user = state.session.user as { is_staff?: boolean; is_superuser?: boolean };
  const isAdmin = Boolean(user?.is_staff || user?.is_superuser);
  if (!isAdmin) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  if (state.kind === "refreshed") applySessionCookie(response, state.cookie);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
