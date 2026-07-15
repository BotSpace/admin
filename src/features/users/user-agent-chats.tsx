"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, User, Wrench, ClipboardList, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type ThreadSummary = {
  thread_id: string;
  project_id: string;
  title: string;
  updated_at: string;
  run_count: number;
  tokens_used_total: number;
};

type Turn = {
  kind: "user" | "assistant" | "tool" | "plan";
  id: string;
  text?: string;
  reasoning?: string;
  call?: { id: string; name: string; arguments: Record<string, unknown>; result?: string; isError?: boolean };
  plan?: Array<{ id: string; title: string; status: string; notes?: string | null }>;
};

type Props = {
  userId: string;
  /** project_id → display name, from the already-loaded user detail. */
  projectNames: Record<string, string>;
};

function formatDate(value: string): string {
  const t = Date.parse(value);
  if (Number.isNaN(t)) return value;
  return new Date(t).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserAgentChats({ userId, projectNames }: Props) {
  const [threads, setThreads] = useState<ThreadSummary[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[] | null>(null);
  const [turnsLoading, setTurnsLoading] = useState(false);
  const [turnsError, setTurnsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/agent-threads`);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { threads: ThreadSummary[] };
        if (!cancelled) setThreads(data.threads);
      } catch {
        if (!cancelled) setListError("AI suhbatlarni yuklab bo'lmadi");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const openThread = useCallback(
    async (threadId: string) => {
      setActive(threadId);
      setTurns(null);
      setTurnsError(null);
      setTurnsLoading(true);
      try {
        const res = await fetch(
          `/api/admin/users/${userId}/agent-threads/${encodeURIComponent(threadId)}`
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { turns: Turn[] };
        setTurns(data.turns);
      } catch {
        setTurnsError("Suhbat tarixini yuklab bo'lmadi");
      } finally {
        setTurnsLoading(false);
      }
    },
    [userId]
  );

  if (listError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {listError}
      </div>
    );
  }

  if (threads === null) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        <MessageSquare className="h-8 w-8 opacity-40" />
        Bu foydalanuvchi AI agent bilan hali suhbatlashmagan.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      {/* Thread list */}
      <div className="space-y-1.5">
        {threads.map((t) => (
          <button
            key={t.thread_id}
            onClick={() => openThread(t.thread_id)}
            className={cn(
              "w-full rounded-lg border p-3 text-left transition hover:bg-muted/50",
              active === t.thread_id ? "border-primary bg-muted/40" : "bg-card"
            )}
          >
            <p className="truncate text-sm font-medium">{t.title || "(sarlavhasiz)"}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>{projectNames[t.project_id] ?? "Loyiha o'chirilgan"}</span>
              <span>·</span>
              <span>{formatDate(t.updated_at)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{t.run_count} ta so&apos;rov</span>
              {t.tokens_used_total > 0 && (
                <span className="font-mono">{t.tokens_used_total.toLocaleString("uz-UZ")} token</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Transcript */}
      <div className="rounded-lg border bg-card p-4">
        {active === null ? (
          <div className="flex h-full min-h-40 items-center justify-center text-sm text-muted-foreground">
            Suhbatni ko&apos;rish uchun chapdan tanlang.
          </div>
        ) : turnsLoading ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda…
          </div>
        ) : turnsError ? (
          <div className="text-sm text-destructive">{turnsError}</div>
        ) : turns && turns.length > 0 ? (
          <div className="space-y-4">
            {turns.map((turn) => (
              <TurnView key={turn.id} turn={turn} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Suhbat bo&apos;sh.</div>
        )}
      </div>
    </div>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  if (turn.kind === "user") {
    return (
      <div className="flex gap-3">
        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 rounded-lg bg-muted/50 p-3">
          <p className="whitespace-pre-wrap break-words text-sm">{turn.text}</p>
        </div>
      </div>
    );
  }

  if (turn.kind === "assistant") {
    return (
      <div className="flex gap-3">
        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {turn.reasoning && (
            <details className="rounded-md border border-dashed bg-muted/30 p-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none">Fikrlash (reasoning)</summary>
              <p className="mt-1 whitespace-pre-wrap break-words">{turn.reasoning}</p>
            </details>
          )}
          {turn.text && (
            <p className="whitespace-pre-wrap break-words text-sm">{turn.text}</p>
          )}
        </div>
      </div>
    );
  }

  if (turn.kind === "tool") {
    const call = turn.call;
    return (
      <div className="flex gap-3">
        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Wrench className="h-4 w-4" />
        </div>
        <details className="min-w-0 flex-1 rounded-md border bg-muted/20 p-2 text-xs">
          <summary className="cursor-pointer select-none font-mono text-[12px]">
            {call?.name ?? "tool"}
            {call?.isError && <span className="ml-2 text-destructive">xato</span>}
          </summary>
          {call?.arguments && (
            <pre className="mt-2 overflow-x-auto rounded bg-background p-2 text-[11px]">
              {JSON.stringify(call.arguments, null, 2)}
            </pre>
          )}
          {call?.result && (
            <pre className="mt-1 max-h-60 overflow-auto rounded bg-background p-2 text-[11px] whitespace-pre-wrap break-words">
              {call.result}
            </pre>
          )}
        </details>
      </div>
    );
  }

  // plan
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <ClipboardList className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 rounded-md border bg-muted/20 p-3">
        <ol className="space-y-1 text-sm">
          {(turn.plan ?? []).map((s) => (
            <li key={s.id} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground">{s.status}</span>
              <span className="break-words">{s.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
