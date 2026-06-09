import Link from "next/link";
import { format } from "date-fns";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { WithdrawalsFilter } from "@/features/withdrawals/withdrawals-filter";

type SearchParams = { status?: string; page?: string };

export default async function KycPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.kycVerifications({ status: sp.status, page });
  } catch {
    result = null;
  }

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
        <h1 className="text-2xl font-bold">Verifikatsiyalar (KYC)</h1>
        <p className="text-muted-foreground text-sm">{result ? `Jami: ${result.total_items}` : ""}</p>
      </div>

      <WithdrawalsFilter defaultStatus={sp.status} />

      {result === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik
        </div>
      ) : result.results.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Verifikatsiyalar topilmadi
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <ul className="divide-y">
            {result.results.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/kyc/${v.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{v.full_name}</span>
                      <Badge variant={statusVariant(v.status)}>{statusLabel(v.status)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {v.user_phone ?? `#${v.user}`} · {format(new Date(v.created_at), "dd.MM.yyyy HH:mm")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
