/* eslint-disable @next/next/no-img-element */
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { WithdrawalsFilter } from "@/features/withdrawals/withdrawals-filter";
import { KycActions } from "@/features/kyc/kyc-actions";
import { format } from "date-fns";

type SearchParams = { status?: string; page?: string };

const DOC_LABELS: { key: "passport_image" | "selfie_image" | "residence_reference"; label: string }[] = [
  { key: "passport_image", label: "Pasport" },
  { key: "selfie_image", label: "Selfie" },
  { key: "residence_reference", label: "Ma'lumotnoma" },
];

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

  const isImage = (url: string) => /\.(jpe?g|png|webp|gif)$/i.test(url);

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
        <div className="space-y-4">
          {result.results.map((v) => (
            <div key={v.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{v.full_name}</span>
                    <Badge variant={statusVariant(v.status)}>{statusLabel(v.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {v.user_phone ?? `#${v.user}`} · {format(new Date(v.created_at), "dd.MM.yyyy HH:mm")}
                  </p>
                </div>
                {v.status === "pending" && <KycActions id={v.id} />}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {DOC_LABELS.map(({ key, label }) => {
                  const url = v[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-md border transition-colors hover:border-blue-500/50"
                    >
                      <div className="flex h-32 items-center justify-center bg-muted/40">
                        {isImage(url) ? (
                          <img src={url} alt={label} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">PDF / Hujjat — ochish</span>
                        )}
                      </div>
                      <div className="px-3 py-2 text-xs font-medium">{label}</div>
                    </a>
                  );
                })}
              </div>

              {v.status === "rejected" && v.rejection_reason && (
                <p className="mt-3 text-sm text-destructive">Sabab: {v.rejection_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
