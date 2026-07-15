import "server-only";
import { env } from "@/shared/lib/env";

// Read-only, server-to-server access to the agent service's /admin/* endpoints.
// Auth is the shared internal token (never reaches the browser) — the agent
// gates these routes with require_internal. Only ever called from admin API
// route handlers that have already passed requireAdmin().

const AGENT_BASE = env.AGENT_API_URL.replace(/\/$/, "");

export type AgentThreadSummary = {
  thread_id: string;
  project_id: string;
  title: string;
  updated_at: string;
  run_count: number;
  tokens_used_total: number;
};

export type AgentTurn = {
  kind: "user" | "assistant" | "tool" | "plan";
  id: string;
  text?: string;
  reasoning?: string;
  call?: {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result?: string;
    isError?: boolean;
  };
  plan?: Array<{ id: string; title: string; status: string; notes?: string | null }>;
};

async function agentFetch(path: string): Promise<Response> {
  const token = env.AGENT_INTERNAL_API_TOKEN;
  if (!token) throw new Error("AGENT_INTERNAL_API_TOKEN not configured");
  return fetch(AGENT_BASE + path, {
    headers: { Accept: "application/json", "X-Internal-Token": token },
    cache: "no-store",
  });
}

export async function listUserAgentThreads(
  userId: string
): Promise<AgentThreadSummary[]> {
  const res = await agentFetch(
    `/admin/users/${encodeURIComponent(userId)}/threads?limit=100`
  );
  if (!res.ok) throw new Error(`agent list threads failed: ${res.status}`);
  const data = (await res.json()) as { threads?: AgentThreadSummary[] };
  return data.threads ?? [];
}

export async function getUserAgentThread(
  userId: string,
  threadId: string
): Promise<{ thread_id: string; turns: AgentTurn[] }> {
  const res = await agentFetch(
    `/admin/users/${encodeURIComponent(userId)}/threads/${encodeURIComponent(threadId)}`
  );
  if (!res.ok) throw new Error(`agent get thread failed: ${res.status}`);
  return res.json();
}
