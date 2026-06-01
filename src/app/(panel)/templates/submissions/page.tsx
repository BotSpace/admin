import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { SubmissionActions } from "@/features/templates/submission-actions";
import { SubmissionsFilter } from "@/features/templates/submissions-filter";
import { format } from "date-fns";

type SearchParams = {
  status?: string;
  search?: string;
  price_min?: string;
  price_max?: string;
  created_after?: string;
  created_before?: string;
  ordering?: string;
  page?: string;
};

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.submissions({
      status: sp.status,
      search: sp.search,
      price_min: sp.price_min,
      price_max: sp.price_max,
      created_after: sp.created_after,
      created_before: sp.created_before,
      ordering: sp.ordering,
      page,
    });
  } catch {
    result = null;
  }

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.status) params.set("status", sp.status);
    if (sp.search) params.set("search", sp.search);
    if (sp.price_min) params.set("price_min", sp.price_min);
    if (sp.price_max) params.set("price_max", sp.price_max);
    if (sp.created_after) params.set("created_after", sp.created_after);
    if (sp.created_before) params.set("created_before", sp.created_before);
    if (sp.ordering) params.set("ordering", sp.ordering);
    params.set("page", String(p));
    return `/templates/submissions?${params.toString()}`;
  };

  const statusVariant = (s: string) => {
    if (s === "approved") return "success" as const;
    if (s === "rejected") return "destructive" as const;
    return "warn" as const;
  };

  const statusLabel = (s: string) => {
    if (s === "approved") return "Tasdiqlangan";
    if (s === "rejected") return "Rad etilgan";
    return "Kutmoqda";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tasdiqlash so&apos;rovlari</h1>
        <p className="text-muted-foreground text-sm">{result ? `Jami: ${result.total_items}` : ""}</p>
      </div>

      <SubmissionsFilter
        defaultSearch={sp.search}
        defaultStatus={sp.status}
        defaultPriceMin={sp.price_min}
        defaultPriceMax={sp.price_max}
        defaultCreatedAfter={sp.created_after}
        defaultCreatedBefore={sp.created_before}
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
          emptyMessage="So'rovlar topilmadi"
          columns={[
            { key: "id", header: "ID", cell: (s) => <span className="font-mono text-xs">#{s.id}</span> },
            {
              key: "template",
              header: "Shablon",
              cell: (s) => (
                <a href={`/templates/submissions/${s.id}`} className="hover:underline font-medium">
                  {s.name || s.template_name || "—"}
                </a>
              ),
            },
            {
              key: "user",
              header: "Foydalanuvchi",
              cell: (s) => s.user_phone || s.submitted_by_phone || "—",
            },
            {
              key: "project",
              header: "Loyiha",
              cell: (s) => s.project_name || "—",
            },
            {
              key: "status",
              header: "Holat",
              cell: (s) => <Badge variant={statusVariant(s.status)}>{statusLabel(s.status)}</Badge>,
            },
            {
              key: "created",
              header: "Yuborilgan",
              cell: (s) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(s.created_at), "dd.MM.yyyy")}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              cell: (s) => s.status === "pending" ? <SubmissionActions id={s.id} /> : null,
            },
          ]}
        />
      )}
    </div>
  );
}
