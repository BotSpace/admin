import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { TransactionsFilter } from "@/features/transactions/transactions-filter";
import { format } from "date-fns";
import { formatCurrency } from "@/shared/lib/utils";

type SearchParams = {
  search?: string;
  status?: string;
  amount_min?: string;
  amount_max?: string;
  created_after?: string;
  created_before?: string;
  ordering?: string;
  page?: string;
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.transactions({
      search: sp.search,
      status: sp.status,
      amount_min: sp.amount_min,
      amount_max: sp.amount_max,
      created_after: sp.created_after,
      created_before: sp.created_before,
      ordering: sp.ordering,
      page,
    });
  } catch {
    result = null;
  }

  function buildPageHref(p: number): string {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.status) params.set("status", sp.status);
    if (sp.amount_min) params.set("amount_min", sp.amount_min);
    if (sp.amount_max) params.set("amount_max", sp.amount_max);
    if (sp.created_after) params.set("created_after", sp.created_after);
    if (sp.created_before) params.set("created_before", sp.created_before);
    if (sp.ordering) params.set("ordering", sp.ordering);
    params.set("page", String(p));
    return `/transactions?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tranzaksiyalar</h1>
        <p className="text-muted-foreground text-sm">
          {result ? `Jami: ${result.total_items}` : ""}
        </p>
      </div>

      <TransactionsFilter
        defaultSearch={sp.search}
        defaultStatus={sp.status}
        defaultAmountMin={sp.amount_min}
        defaultAmountMax={sp.amount_max}
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
          emptyMessage="Tranzaksiyalar topilmadi"
          columns={[
            {
              key: "id",
              header: "ID",
              cell: (t) => (
                <Link
                  href={`/transactions/${t.id}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  #{t.id}
                </Link>
              ),
            },
            {
              key: "user",
              header: "Foydalanuvchi",
              cell: (t) => (
                <span className="text-sm text-muted-foreground">
                  {t.user_phone ?? `#${t.user}`}
                </span>
              ),
            },
            {
              key: "amount",
              header: "Summa",
              cell: (t) => (
                <span className="font-mono font-medium text-sm">
                  {formatCurrency(Number(t.amount))}
                </span>
              ),
            },
            {
              key: "status",
              header: "Holat",
              cell: (t) => (
                <Badge variant={t.status ? "success" : "destructive"}>
                  {t.status ? "To‘langan" : "To‘lanmagan"}
                </Badge>
              ),
            },
            {
              key: "created",
              header: "Sana",
              cell: (t) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(t.created_at), "dd.MM.yyyy HH:mm")}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
