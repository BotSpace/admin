"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle, Zap } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { fetchModuleStatus, type ModuleStatus } from "@/shared/api/module-status";

// ── Holat konfiguratsiyasi ──────────────────────────────────────────────────

type StateMeta = {
  label: string;
  variant: "success" | "secondary" | "destructive" | "default" | "warn" | "outline";
  extraClass?: string;
  icon: React.ReactNode;
  pulse?: boolean;
};

function getStateMeta(state: ModuleStatus["state"] | "unknown"): StateMeta {
  switch (state) {
    case "running":
      return {
        label: "Ishlayapti",
        variant: "success",
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    case "building":
      return {
        label: "Build boʻlyapti",
        variant: "default",
        extraClass: "bg-blue-600 text-white border-blue-600",
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        pulse: true,
      };
    case "deploying":
      return {
        label: "Ishga tushmoqda",
        variant: "default",
        extraClass: "bg-blue-500 text-white border-blue-500",
        icon: <Zap className="h-3 w-3" />,
      };
    case "build_failed":
      return {
        label: "Build xato",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
      };
    case "error":
      return {
        label: "Xato",
        variant: "destructive",
        icon: <AlertCircle className="h-3 w-3" />,
      };
    case "stopped":
      return {
        label: "Toʻxtagan",
        variant: "secondary",
        icon: <Clock className="h-3 w-3" />,
      };
    default:
      return {
        label: "Nomaʻlum",
        variant: "outline",
        icon: <AlertCircle className="h-3 w-3 opacity-50" />,
      };
  }
}

// ── Tooltip ────────────────────────────────────────────────────────────────

function statusTooltip(status: ModuleStatus): string {
  const parts: string[] = [];
  if (status.mode === "github") {
    if (status.pod) {
      const podLabel =
        status.pod === "running"
          ? "Pod: ishlamoqda"
          : status.pod === "init"
          ? "Pod: ishga tushmoqda"
          : "Pod: toʻxtagan";
      parts.push(podLabel);
    }
    if (status.build) {
      const buildLabel =
        status.build.status === "succeeded"
          ? "Build: muvaffaqiyatli"
          : status.build.status === "failed"
          ? "Build: xato"
          : status.build.status === "running"
          ? "Build: jarayonda"
          : "Build: yoʼq";
      parts.push(buildLabel);
      if (status.build.at) {
        const d = new Date(status.build.at);
        if (!isNaN(d.getTime())) {
          parts.push(
            d.toLocaleString("uz-UZ", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
      }
    }
  } else {
    if (status.endpoint) parts.push(`Endpoint: ${status.endpoint}`);
    parts.push(status.reachable ? "Mavjud: ha" : "Mavjud: yoʼq");
  }
  return parts.join(" • ");
}

// ── Props ──────────────────────────────────────────────────────────────────

type Props = {
  slug: string;
  /** Katta ko'rinish (detail page uchun) */
  size?: "sm" | "md";
};

// ── Komponent ──────────────────────────────────────────────────────────────

export function ModuleStatusBadge({ slug, size = "sm" }: Props) {
  const [status, setStatus] = useState<ModuleStatus | null>(null);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function load() {
    fetchModuleStatus(slug)
      .then((s) => {
        setStatus(s);
        setError(false);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const state = error ? "unknown" : status?.state ?? "unknown";
  const meta = getStateMeta(state);
  const tooltip = status ? statusTooltip(status) : undefined;

  return (
    <Badge
      variant={meta.variant}
      title={tooltip}
      className={cn(
        "gap-1 cursor-default select-none",
        meta.extraClass,
        size === "md" && "px-3 py-1 text-sm",
        meta.pulse && "animate-pulse"
      )}
    >
      {meta.icon}
      {meta.label}
    </Badge>
  );
}
