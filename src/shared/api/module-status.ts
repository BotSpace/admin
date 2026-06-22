// Client-safe: "server-only" yo'q — brauzerdan ham chaqirish mumkin.

export type ModuleStatus = {
  slug: string;
  mode: "github" | "endpoint";
  active: boolean;
  node_count: number;
  manifest_fetched_at: string | null;
  state: "running" | "building" | "deploying" | "build_failed" | "stopped" | "error";
  // github mode
  pod?: "running" | "init" | "stopped";
  build?: {
    status: "succeeded" | "failed" | "running" | "none" | "unknown";
    job?: string;
    at?: string;
  };
  // endpoint (self-hosted) mode
  endpoint?: string;
  reachable?: boolean;
};

/** Proksi route handler orqali holat oladi (cookie auth avtomatik). */
export async function fetchModuleStatus(slug: string): Promise<ModuleStatus> {
  const res = await fetch(`/api/modules/${slug}/status`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ModuleStatus>;
}
