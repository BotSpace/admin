import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { AuditLogFilter } from "@/features/audit-log/audit-log-filter";
import { format } from "date-fns";

type SearchParams = {
  action?: string;
  target_type?: string;
  target_id?: string;
  actor?: string;
  page?: string;
};

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.auditLog({
      action: sp.action,
      target_type: sp.target_type,
      target_id: sp.target_id ? Number(sp.target_id) : undefined,
      actor: sp.actor ? Number(sp.actor) : undefined,
      page,
    });
  } catch {
    result = null;
  }

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.action) params.set("action", sp.action);
    if (sp.target_type) params.set("target_type", sp.target_type);
    if (sp.target_id) params.set("target_id", sp.target_id);
    if (sp.actor) params.set("actor", sp.actor);
    params.set("page", String(p));
    return `/audit-log?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-muted-foreground text-sm">{result ? `Jami: ${result.total_items}` : ""}</p>
      </div>

      <AuditLogFilter defaultAction={sp.action} defaultTargetType={sp.target_type} />

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
          emptyMessage="Audit yozuvlari topilmadi"
          columns={[
            { key: "id", header: "ID", cell: (l) => <span className="font-mono text-xs">#{l.id}</span> },
            { key: "actor", header: "Amalga oshiruvchi", cell: (l) => l.actor_phone ?? `#${l.actor}` },
            {
              key: "action",
              header: "Amal",
              cell: (l) => <Badge variant="secondary">{l.action}</Badge>,
            },
            { key: "target_type", header: "Ob'ekt turi", cell: (l) => l.target_type ?? "—" },
            { key: "target_id", header: "Ob'ekt ID", cell: (l) => l.target_id ? `#${l.target_id}` : "—" },
            { key: "ip", header: "IP", cell: (l) => <span className="font-mono text-xs">{l.ip_address ?? "—"}</span> },
            {
              key: "created",
              header: "Sana",
              cell: (l) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(l.created_at), "dd.MM.yyyy HH:mm")}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
