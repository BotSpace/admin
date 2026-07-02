import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { AdminAPI } from "@/shared/api/services";
import { MetricChart } from "@/features/monitoring/metric-chart";
import { RangeSelector } from "@/features/monitoring/range-selector";
import { formatBytes, formatCpu, formatBps } from "@/features/monitoring/monitoring-utils";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChevronLeft } from "lucide-react";

type SearchParams = { range?: string };
type Params = { id: string };

const VALID_RANGES = ["1h", "6h", "24h", "7d"] as const;
type ValidRange = (typeof VALID_RANGES)[number];

function isValidRange(r: string | undefined): r is ValidRange {
  return VALID_RANGES.includes(r as ValidRange);
}

function ReleaseStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant="outline">Reliz yo&apos;q</Badge>;
  const map: Record<string, "success" | "warn" | "destructive" | "secondary"> = {
    running: "success",
    active: "success",
    stopped: "destructive",
    error: "destructive",
    failed: "destructive",
    pending: "warn",
    building: "warn",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}

export default async function MonitoringDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const range = isValidRange(sp.range) ? sp.range : "24h";
  const showDate = range === "7d";

  let usage;
  try {
    // Loyiha usage ma'lumotlarini monitoring list'dan bitta element sifatida olish.
    // Agar alohida detail endpoint bo'lmasa, list'dan id bo'yicha filter qilamiz.
    const page = await AdminAPI.monitoring({ page: 1 });
    usage = page.results.find((r) => r.id === Number(id)) ?? null;
  } catch {
    usage = null;
  }

  let history;
  try {
    history = await AdminAPI.monitoringHistory(Number(id), range);
  } catch {
    notFound();
  }

  // Agar usage topilmasa — history'dan minimal ma'lumot olish yetarli
  const projectName = usage?.name ?? `Loyiha #${id}`;
  const ownerLabel =
    usage?.owner_name || usage?.owner_phone || (usage ? `#${usage.owner_id}` : null);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/monitoring"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Monitoring
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{projectName}</h1>
          {ownerLabel && (
            <p className="text-sm text-muted-foreground">
              Egasi:{" "}
              {usage ? (
                <Link
                  href={`/users/${usage.owner_id}`}
                  className="text-primary hover:underline"
                >
                  {ownerLabel}
                </Link>
              ) : (
                ownerLabel
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {usage && <ReleaseStatusBadge status={usage.release_status} />}
          <Link
            href={`/projects/${id}`}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Loyiha detali
          </Link>
        </div>
      </div>

      {/* Joriy resurs kartlari */}
      {usage && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-normal">CPU (hozir)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="font-mono text-lg font-semibold">{formatCpu(usage.cpu_cores)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-normal">RAM (hozir)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="font-mono text-lg font-semibold">{formatBytes(usage.memory_bytes)}</p>
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

      {/* Prometheus ogohlantirish */}
      {history && !history.prometheus_available && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          Prometheus ulanmagan — CPU, RAM va Tarmoq grafiklari ko&apos;rsatilmaydi.
        </div>
      )}

      {/* Range tanlagich */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Tarix</h2>
        <Suspense>
          <RangeSelector current={range} />
        </Suspense>
      </div>

      {/* Chartlar */}
      {history && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MetricChart
            title="CPU (vCPU)"
            showDate={showDate}
            series={{
              kind: "single",
              data: history.series.cpu_cores,
              format: "cpu",
            }}
          />
          <MetricChart
            title="RAM"
            showDate={showDate}
            series={{
              kind: "single",
              data: history.series.memory_bytes,
              color: "oklch(0.627 0.194 154.9)",
              format: "bytes",
            }}
          />
          <MetricChart
            title="Tarmoq (kirish / chiqish)"
            showDate={showDate}
            series={{
              kind: "double",
              data1: history.series.net_rx_bps,
              data2: history.series.net_tx_bps,
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
      )}
    </div>
  );
}
