import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { WithdrawalsFilter } from "@/features/withdrawals/withdrawals-filter";
import { format } from "date-fns";

type SearchParams = { status?: string; page?: string };

export default async function BotWithdrawalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.botWithdrawals({ status: sp.status, page });
  } catch {
    result = null;
  }

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.status) params.set("status", sp.status);
    params.set("page", String(p));
    return `/bot-withdrawals?${params.toString()}`;
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
        <h1 className="text-2xl font-bold">Bot daromadidan yechish</h1>
        <p className="text-muted-foreground text-sm">{result ? `Jami: ${result.total_items}` : ""}</p>
      </div>

      <WithdrawalsFilter defaultStatus={sp.status} />

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
            {
              key: "id",
              header: "ID",
              cell: (w) => (
                <Link href={`/bot-withdrawals/${w.id}`} className="font-mono text-xs text-primary hover:underline">
                  #{w.id}
                </Link>
              ),
            },
            { key: "user", header: "Foydalanuvchi", cell: (w) => w.user_phone ?? `#${w.user}` },
            { key: "bot", header: "Bot", cell: (w) => w.project_name ?? "—" },
            {
              key: "amount",
              header: "Miqdor",
              cell: (w) => <span className="font-mono font-medium">{w.amount}</span>,
            },
            {
              key: "card",
              header: "Karta",
              cell: (w) => (
                <div className="text-xs text-muted-foreground">
                  <span className="block whitespace-nowrap font-mono">{w.card_number}</span>
                  <span className="block whitespace-nowrap">{w.card_owner}</span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Holat",
              cell: (w) => <Badge variant={statusVariant(w.status)}>{statusLabel(w.status)}</Badge>,
            },
            {
              key: "created",
              header: "Sana",
              cell: (w) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(w.created_at), "dd.MM.yyyy HH:mm")}
                </span>
              ),
            },
            {
              key: "view",
              header: "",
              cell: (w) => (
                <Link href={`/bot-withdrawals/${w.id}`} className="text-xs text-primary hover:underline">
                  Ko&apos;rish →
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
