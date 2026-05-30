import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { format } from "date-fns";

type SearchParams = { page?: string };

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.transactions({ page });
  } catch {
    result = null;
  }

  const buildPageHref = (p: number) => `/transactions?page=${p}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tranzaksiyalar</h1>
        <p className="text-muted-foreground text-sm">{result ? `Jami: ${result.total_items}` : ""}</p>
      </div>

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
            { key: "id", header: "ID", cell: (t) => <span className="font-mono text-xs">#{t.id}</span> },
            { key: "user", header: "Foydalanuvchi", cell: (t) => t.user_phone ?? `#${t.user}` },
            { key: "type", header: "Turi", cell: (t) => <span className="text-sm">{t.type}</span> },
            {
              key: "amount",
              header: "Miqdor",
              cell: (t) => <span className="font-mono font-medium">{t.amount}</span>,
            },
            { key: "desc", header: "Izoh", cell: (t) => t.description ?? "—" },
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
