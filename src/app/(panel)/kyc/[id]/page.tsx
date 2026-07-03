/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { KycActions } from "@/features/kyc/kyc-actions";

const DOCS: { key: "passport_image" | "selfie_image" | "residence_reference"; label: string }[] = [
  { key: "passport_image", label: "Pasport" },
  { key: "selfie_image", label: "Selfie" },
  { key: "residence_reference", label: "Ma'lumotnoma" },
];

const STATUS: Record<string, { label: string; variant: "success" | "destructive" | "warn" }> = {
  approved: { label: "Tasdiqlangan", variant: "success" },
  rejected: { label: "Rad etilgan", variant: "destructive" },
  pending: { label: "Kutmoqda", variant: "warn" },
};

const isImage = (url: string) => /\.(jpe?g|png|webp|gif)$/i.test(url);

export default async function KycDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let v;
  try {
    v = await AdminAPI.kycVerification(id);
  } catch {
    notFound();
  }

  const meta = STATUS[v.status] ?? STATUS.pending;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/kyc"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Verifikatsiyalar
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{v.full_name}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {v.user_phone ?? `#${v.user}`} · {format(new Date(v.created_at), "dd.MM.yyyy HH:mm")}
            </p>
          </div>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {DOCS.map(({ key, label }) => {
              const url = v[key];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-md border transition-colors hover:border-primary/50"
                >
                  <div className="flex h-40 items-center justify-center bg-muted/40">
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
            <p className="text-sm text-destructive">Rad etish sababi: {v.rejection_reason}</p>
          )}
        </CardContent>
      </Card>

      {v.status === "pending" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Qaror</CardTitle>
          </CardHeader>
          <CardContent>
            <KycActions id={v.id} />
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          So&apos;rov allaqachon ko&apos;rib chiqilgan.
        </p>
      )}
    </div>
  );
}
