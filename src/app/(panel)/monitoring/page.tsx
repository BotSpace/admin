import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { MonitoringFilter } from "@/features/monitoring/monitoring-filter";
import { formatBytes, formatCpu } from "@/features/monitoring/monitoring-utils";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";

type SearchParams = {
  search?: string;
  has_release?: string;
  ordering?: string;
  page?: string;
};

function ReleaseStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant="outline">Reliz yo&apos;q</Badge>;
  const map: Record<
    string,
    { variant: "success" | "warn" | "destructive" | "secondary"; label: string }
  > = {
    running: { variant: "success", label: "Ishlayapti" },
    active: { variant: "success", label: "Ishlayapti" },
    stopped: { variant: "destructive", label: "Toʼxtagan" },
    error: { variant: "destructive", label: "Xato" },
    failed: { variant: "destructive", label: "Xato" },
    pending: { variant: "warn", label: "Navbatda" },
    building: { variant: "warn", label: "Tayyorlanmoqda" },
  };
  const m = map[status] ?? { variant: "secondary" as const, label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.monitoring({
      search: sp.search,
      has_release: sp.has_release,
      ordering: sp.ordering,
      page,
    });
  } catch {
    result = null;
  }

  function buildPageHref(p: number): string {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.has_release) params.set("has_release", sp.has_release);
    if (sp.ordering) params.set("ordering", sp.ordering);
    params.set("page", String(p));
    return `/monitoring?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Monitoring</h1>
        <p className="text-muted-foreground text-sm">
          {result ? `Jami: ${result.total_items} loyiha` : ""}
        </p>
      </div>

      {result && !result.prometheus_available && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Prometheus ulanmagan — CPU va RAM ko&apos;rsatilmaydi. Disk ma&apos;lumotlari
            baribir ko&apos;rinadi.
          </span>
        </div>
      )}

      <MonitoringFilter
        defaultSearch={sp.search}
        defaultHasRelease={sp.has_release}
        defaultOrdering={sp.ordering}
      />

      {result === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik
        </div>
      ) : (
        <DataTable
          data={result.results}
          currentPage={result.current_page}
          totalPages={result.total_pages}
          buildPageHref={buildPageHref}
          emptyMessage="Loyihalar topilmadi"
          rowHref={(row) => `/monitoring/${row.id}`}
          columns={[
            {
              key: "project",
              header: "Loyiha",
              cell: (row) => (
                <div className="min-w-0">
                  <Link
                    href={`/monitoring/${row.id}`}
                    className="font-medium text-sm hover:underline line-clamp-1"
                  >
                    {row.name}
                  </Link>
                  {row.username && (
                    <p className="text-xs text-muted-foreground font-mono">
                      @{row.username}
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: "owner",
              header: "Egasi",
              cell: (row) => (
                <Link
                  href={`/users/${row.owner_id}`}
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {row.owner_name || row.owner_phone || `#${row.owner_id}`}
                </Link>
              ),
            },
            {
              key: "release_status",
              header: "Reliz holati",
              cell: (row) => <ReleaseStatusBadge status={row.release_status} />,
            },
            {
              key: "cpu",
              header: "CPU",
              cell: (row) => (
                <span className="font-mono text-xs">
                  {formatCpu(row.cpu_cores)}
                </span>
              ),
            },
            {
              key: "memory",
              header: "RAM",
              cell: (row) => (
                <span className="font-mono text-xs">
                  {formatBytes(row.memory_bytes)}
                </span>
              ),
            },
            {
              key: "disk",
              header: "Disk",
              cell: (row) => (
                <span className="font-mono text-xs">
                  {formatBytes(row.disk_bytes)}
                </span>
              ),
            },
            {
              key: "created_at",
              header: "Yaratilgan",
              cell: (row) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(row.created_at), "dd.MM.yyyy")}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
