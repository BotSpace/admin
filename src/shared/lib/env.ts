import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  // Backend paths in the code are hardcoded as "/api/v1/...". In prod this
  // gateway host rewrites "/api/v2" -> the new Go backend's "/api/v1", so we
  // rewrite the leading "/api/v1" segment to this prefix at request time
  // (see shared/api/client.ts#buildUrl). Localhost keeps hitting the Go
  // backend's real "/api/v1" directly, so the default stays "/api/v1".
  NEXT_PUBLIC_API_PREFIX: z.string().default("/api/v1"),
  NEXT_PUBLIC_DASHBOARD_URL: z.string().url().default("https://botspace.uz"),
  SESSION_COOKIE_NAME: z.string().default("bm_session"),
  SESSION_COOKIE_DOMAIN: z.string().optional(),
  SESSION_SECRET: z.string().min(16),
  // Server-to-server access to the agent service for read-only admin views
  // (a user's AI-agent conversations). In-cluster the agent is reachable at
  // http://agent:8100; the internal token gates its /admin/* endpoints.
  AGENT_API_URL: z.string().url().default("http://agent:8100"),
  AGENT_INTERNAL_API_TOKEN: z.string().optional(),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
  NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
  SESSION_SECRET: process.env.SESSION_SECRET,
  AGENT_API_URL: process.env.AGENT_API_URL,
  AGENT_INTERNAL_API_TOKEN: process.env.AGENT_INTERNAL_API_TOKEN,
});

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
// Bu modul client bundle'ga ham kiradi. Brauzerda SESSION_SECRET server siri
// mavjud emas — shuning uchun throw faqat serverda ishlaydi, aks holda sahifa
// brauzerda oq ekran bilan yiqiladi.
const isServer = typeof window === "undefined";

if (!parsed.success) {
  if (isServer && process.env.NODE_ENV === "production" && !isBuildPhase) {
    throw new Error(
      "[env] missing/invalid required env vars: " +
        JSON.stringify(parsed.error.flatten().fieldErrors)
    );
  }
  if (isServer && process.env.NODE_ENV !== "production") {
    console.warn("[env] missing/invalid env vars:", parsed.error.flatten().fieldErrors);
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.botspace.uz",
      NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1",
      NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://botspace.uz",
      SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "bm_session",
      SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
      SESSION_SECRET:
        process.env.SESSION_SECRET ??
        (process.env.NODE_ENV === "production" ? "" : "dev-secret-change-me-please-32chars"),
      AGENT_API_URL: process.env.AGENT_API_URL ?? "http://agent:8100",
      AGENT_INTERNAL_API_TOKEN: process.env.AGENT_INTERNAL_API_TOKEN,
    };
