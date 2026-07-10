import Link from "next/link";
import { AdminAPI, type AdminProjectUsage } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { ProjectsFilter } from "@/features/projects/projects-filter";
import { formatBytes, formatCpu } from "@/features/monitoring/monitoring-utils";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SearchParams = {
  search?: string;
  is_template?: string;
  has_release?: string;
  created_after?: string;
  created_before?: string;
  ordering?: string;
  page?: string;
};

// Common row shape the table renders — satisfied by both the projects list
// (AdminProject) and the monitoring list (AdminProjectUsage) so a resource sort
// can swap the data source without changing the columns.
type Row = {
  id: string;
  name: string;
  owner_id?: string;
  owner_phone?: string | null;
  is_template?: boolean;
  release_status?: string | null;
  created_at: string;
};

const RESOURCE_ORDERING = /^(cpu|ram|disk|net)_(asc|desc)$/;
function isResourceOrdering(o?: string): boolean {
  return !!o && RESOURCE_ORDERING.test(o);
}

// Oxirgi reliz holatini "bot ishlayaptimi" ko'rinishida ko'rsatadi.
function ReleaseStatusBadge({ status }: { status?: string | null }) {
  if (!status) {
    return <Badge variant="outline">Reliz yo&apos;q</Badge>;
  }
  const map: Record<string, { variant: "success" | "warn" | "destructive" | "secondary"; label: string }> = {
    running: { variant: "success", label: "Ishlayapti" },
    active: { variant: "success", label: "Ishlayapti" },
    stopped: { variant: "destructive", label: "To'xtagan" },
    error: { variant: "destructive", label: "Xato" },
    failed: { variant: "destructive", label: "Xato" },
    pending: { variant: "warn", label: "Navbatda" },
    building: { variant: "warn", label: "Tayyorlanmoqda" },
  };
  const m = map[status] ?? { variant: "secondary" as const, label: status };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const ordering = sp.ordering;
  const resourceSort = isResourceOrdering(ordering);

  let rows: Row[] = [];
  let usageById = new Map<string, AdminProjectUsage>();
  let currentPage = 1;
  let totalPages = 1;
  let totalItems = 0;
  let loadError = false;

  if (resourceSort) {
    // Resource sort is done server-side by the monitoring endpoint; its rows
    // carry both the project fields and the resource metrics, so use them for
    // the table AND the metric columns.
    try {
      const mon = await AdminAPI.monitoring({ search: sp.search, ordering, page });
      rows = mon.results;
      mon.results.forEach((u) => usageById.set(u.id, u));
      currentPage = mon.current_page;
      totalPages = mon.total_pages;
      totalItems = mon.total_items;
    } catch {
      loadError = true;
    }
  } else {
    try {
      const result = await AdminAPI.projects({
        search: sp.search,
        is_template: sp.is_template,
        has_release: sp.has_release,
        created_after: sp.created_after,
        created_before: sp.created_before,
        ordering: sp.ordering,
        page,
      });
      rows = result.results;
      currentPage = result.current_page;
      totalPages = result.total_pages;
      totalItems = result.total_items;
      // Merge the page's resource metrics from the monitoring endpoint (same
      // window); rows not found show "—".
      try {
        const mon = await AdminAPI.monitoring({
          search: sp.search,
          page: result.current_page,
          page_size: result.page_size,
        });
        mon.results.forEach((u) => usageById.set(u.id, u));
      } catch {
        // metrics unavailable — columns fall back to "—"
      }
    } catch {
      loadError = true;
    }
  }

  function withParams(overrides: Partial<SearchParams>): string {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, String(v));
    }
    return `/projects?${params.toString()}`;
  }

  function buildPageHref(p: number): string {
    return withParams({ page: String(p) });
  }

  // Cycles a resource column: none → desc → asc → none.
  function sortHref(field: string): string {
    let next: string | undefined;
    if (ordering === `${field}_desc`) next = `${field}_asc`;
    else if (ordering === `${field}_asc`) next = undefined;
    else next = `${field}_desc`;
    return withParams({ ordering: next, page: undefined });
  }

  function SortHeader({ field, label }: { field: string; label: string }) {
    const dir = ordering === `${field}_desc` ? "desc" : ordering === `${field}_asc` ? "asc" : null;
    return (
      <Link href={sortHref(field)} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        {dir === "desc" ? (
          <ArrowDown className="h-3 w-3" />
        ) : dir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </Link>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Loyihalar</h1>
        <p className="text-muted-foreground text-sm">
          {loadError ? "" : `Jami: ${totalItems}`}
        </p>
      </div>

      <ProjectsFilter
        defaultSearch={sp.search}
        defaultIsTemplate={sp.is_template}
        defaultHasRelease={sp.has_release}
        defaultCreatedAfter={sp.created_after}
        defaultCreatedBefore={sp.created_before}
        defaultOrdering={sp.ordering}
      />

      {resourceSort && (
        <p className="text-xs text-muted-foreground">
          Resurs bo&apos;yicha saralashda boshqa filtrlar (turi, sana) qo&apos;llanmaydi.
        </p>
      )}

      {loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik
        </div>
      ) : (
        <DataTable
          data={rows}
          currentPage={currentPage}
          totalPages={totalPages}
          buildPageHref={buildPageHref}
          emptyMessage="Loyihalar topilmadi"
          columns={[
            {
              key: "id",
              header: "ID",
              cell: (p) => (
                <Link
                  href={`/projects/${p.id}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  #{p.id}
                </Link>
              ),
            },
            {
              key: "name",
              header: "Nomi",
              cell: (p) => (
                <Link
                  href={`/projects/${p.id}`}
                  className="hover:underline text-sm font-medium"
                >
                  {p.name}
                </Link>
              ),
            },
            {
              key: "owner",
              header: "Egasi",
              cell: (p) => (
                <span className="text-sm text-muted-foreground">
                  {p.owner_phone ?? `#${p.owner_id}`}
                </span>
              ),
            },
            {
              key: "is_template",
              header: "Turi",
              cell: (p) => (
                <Badge variant={p.is_template ? "secondary" : "outline"}>
                  {p.is_template ? "Shablon" : "Oddiy"}
                </Badge>
              ),
            },
            {
              key: "release_status",
              header: "Holat",
              cell: (p) => <ReleaseStatusBadge status={p.release_status} />,
            },
            {
              key: "cpu",
              header: <SortHeader field="cpu" label="CPU" />,
              cell: (p) => (
                <span className="font-mono text-xs text-muted-foreground">
                  {formatCpu(usageById.get(p.id)?.cpu_cores ?? null)}
                </span>
              ),
            },
            {
              key: "memory",
              header: <SortHeader field="ram" label="RAM" />,
              cell: (p) => (
                <span className="font-mono text-xs text-muted-foreground">
                  {formatBytes(usageById.get(p.id)?.memory_bytes ?? null)}
                </span>
              ),
            },
            {
              key: "disk",
              header: <SortHeader field="disk" label="Disk" />,
              cell: (p) => (
                <span className="font-mono text-xs text-muted-foreground">
                  {formatBytes(usageById.get(p.id)?.disk_bytes ?? null)}
                </span>
              ),
            },
            {
              key: "net",
              header: <SortHeader field="net" label="Network" />,
              cell: (p) => (
                <span className="font-mono text-xs text-muted-foreground">
                  {formatBytes(usageById.get(p.id)?.net_bytes ?? null)}
                </span>
              ),
            },
            {
              key: "created",
              header: "Yaratilgan",
              cell: (p) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(p.created_at), "dd.MM.yyyy")}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              cell: (p) => <DeleteProjectButton id={p.id} name={p.name} />,
            },
          ]}
        />
      )}
    </div>
  );
}
