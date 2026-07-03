import Link from "next/link";
import { format } from "date-fns";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { WithdrawalsFilter } from "@/features/withdrawals/withdrawals-filter";

type SearchParams = { status?: string; page?: string };

export default async function TicketsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.tickets({ status: sp.status, page });
  } catch {
    result = null;
  }

  const statusVariant = (s: string) => (s === "closed" ? ("secondary" as const) : ("warn" as const));
  const statusLabel = (s: string) => {
    if (s === "closed") return "Yopiq";
    if (s === "pending") return "Javob berilgan";
    return "Ochiq";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ticketlar</h1>
        <p className="text-muted-foreground text-sm">{result ? `Jami: ${result.total_items}` : "Foydalanuvchi so'rovlari"}</p>
      </div>

      <WithdrawalsFilter defaultStatus={sp.status} />

      {result === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik
        </div>
      ) : result.results.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Ticketlar topilmadi
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <ul className="divide-y">
            {result.results.map((tk) => {
              const last = tk.messages?.[tk.messages.length - 1];
              return (
                <li key={tk.id}>
                  <Link
                    href={`/tickets/${tk.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{tk.subject}</span>
                        <Badge variant={statusVariant(tk.status)}>{statusLabel(tk.status)}</Badge>
                      </div>
                      {last && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                          {last.sender === "admin" && <span className="font-medium">Siz: </span>}
                          {last.message}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {/* Backend doesn't join requester identity onto ticket list/detail yet */}
                        {tk.user_phone ?? (tk.user ? `#${tk.user}` : null)}
                        {tk.user_phone || tk.user ? " · " : ""}
                        {format(new Date(tk.created_at), "dd.MM.yyyy HH:mm")}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-primary">Ko&apos;rish →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
