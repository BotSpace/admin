import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_DASHBOARD_URL: z.string().url().default("https://botspace.uz"),
  SESSION_COOKIE_NAME: z.string().default("bm_session"),
  SESSION_COOKIE_DOMAIN: z.string().optional(),
  SESSION_SECRET: z.string().min(16),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
  SESSION_SECRET: process.env.SESSION_SECRET,
});

if (!parsed.success && process.env.NODE_ENV !== "production") {
  console.warn("[env] missing/invalid env vars:", parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.botspace.uz",
      NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://botspace.uz",
      SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "bm_session",
      SESSION_COOKIE_DOMAIN: process.env.SESSION_COOKIE_DOMAIN,
      SESSION_SECRET: process.env.SESSION_SECRET ?? "dev-secret-change-me-please-32chars",
    };
