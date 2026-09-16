"use client";

import { useState, useTransition } from "react";
import type { AdminProjectUsage, MonitoringHistory } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { MetricChart } from "./metric-chart";
import { formatBytes, formatCpu } from "./monitoring-utils";
import { fetchMonitoringHistoryAction } from "./actions";

const RANGES = [
  { label: "1s", value: "1h" },
  { label: "6s", value: "6h" },
  { label: "24s", value: "24h" },
  { label: "7 kun", value: "7d" },
] as const;

type Props = {
  projectId: string;
  usage: AdminProjectUsage | null;
  initialHistory: MonitoringHistory | null;
};

// Project detail's Monitoring tab: current CPU/RAM/Disk snapshot plus the
// time-series charts. Range switching re-fetches via a server action so the tab
// (and the surrounding project page) is not reloaded.
export function ProjectMonitoringTab({ projectId, usage, initialHistory }: Props) {
  const [range, setRange] = useState<string>(initialHistory?.range ?? "24h");
  const [history, setHistory] = useState<MonitoringHistory | null>(initialHistory);
  const [pending, startTransition] = useTransition();

  function selectRange(next: string) {
    if (next === range && history) return;
    setRange(next);
    startTransition(async () => {
      setHistory(await fetchMonitoringHistoryAction(projectId, next));
    });
  }

  const showDate = range === "7d";

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Pool CPU/RAM — botning alohida child-process CPU/RSS o&apos;lchovlari, umumiy worker ulushi emas.
        Pool uchun per-bot tarmoq metrikasi mavjud emas; tarmoq grafigi faqat dedicated pod namunalari bo&apos;lsa ko&apos;rsatiladi.
      </p>
      {(!usage || !usage.resource_metrics_available) && (
        <p role="status" className="text-sm text-amber-700 dark:text-amber-300">
          Joriy CPU/RAM o&apos;lchovlari mavjud emas — bu nol sarf degani emas.
        </p>
      )}
      {/* Joriy resurslar */}
      {usage && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-normal">CPU (hozir)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="font-mono text-lg font-semibold">{formatCpu(usage.resource_metrics_available ? usage.cpu_cores : null)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-normal">RAM (hozir)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="font-mono text-lg font-semibold">{formatBytes(usage.resource_metrics_available ? usage.memory_bytes : null)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-normal">Disk</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="font-mono text-lg font-semibold">{formatBytes(usage.disk_bytes)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {(!history || !history.prometheus_available || !history.resource_metrics_available) && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          {!history
            ? "Tarixni yuklab bo'lmadi. Qayta urinish uchun vaqt oralig'ini bosing."
            : !history.prometheus_available
              ? "Prometheus ma'lumotlari hozir mavjud emas."
              : "Bu vaqt oralig'ida botga tegishli CPU/RAM namunalari mavjud emas."}
          {" "}Disk faqat saqlangan loyiha namunalari bo&apos;lsa ko&apos;rsatiladi.
        </div>
      )}

      {/* Range tanlagich */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Tarix</h2>
        <div className="flex items-center gap-1 rounded-md border bg-card p-1">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={range === r.value ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              disabled={pending}
              onClick={() => selectRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chartlar */}
      {history ? (
        <div className={`grid grid-cols-1 gap-6 lg:grid-cols-2 ${pending ? "opacity-60" : ""}`}>
          <MetricChart
            title="CPU (vCPU)"
            showDate={showDate}
            series={{ kind: "single", data: history.prometheus_available && history.resource_metrics_available ? history.series.cpu_cores : [], format: "cpu" }}
          />
          <MetricChart
            title="RAM"
            showDate={showDate}
            series={{
              kind: "single",
              data: history.prometheus_available && history.resource_metrics_available ? history.series.memory_bytes : [],
              color: "oklch(0.627 0.194 154.9)",
              format: "bytes",
            }}
          />
          <MetricChart
            title="Tarmoq (kirish / chiqish)"
            showDate={showDate}
            series={{
              kind: "double",
              data1: history.prometheus_available ? history.series.net_rx_bps : [],
              data2: history.prometheus_available ? history.series.net_tx_bps : [],
              label1: "Kirish (RX)",
              label2: "Chiqish (TX)",
              color1: "oklch(0.488 0.243 264.376)",
              color2: "oklch(0.705 0.213 47.604)",
              format: "bps",
            }}
          />
          <MetricChart
            title="Disk"
            showDate={showDate}
            series={{
              kind: "single",
              data: history.series.disk_bytes,
              color: "oklch(0.558 0.288 302.321)",
              format: "bytes",
            }}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Tarix ma&apos;lumotlari yo&apos;q.</p>
      )}
    </div>
  );
}
