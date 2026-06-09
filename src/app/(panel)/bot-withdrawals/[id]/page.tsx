import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BotWithdrawalActions } from "@/features/bot-withdrawals/bot-withdrawal-actions";

function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return value;
  }
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

const STATUS: Record<string, { label: string; variant: "success" | "destructive" | "warn" }> = {
  approved: { label: "Tasdiqlangan", variant: "success" },
  rejected: { label: "Rad etilgan", variant: "destructive" },
  pending: { label: "Kutmoqda", variant: "warn" },
};

export default async function BotWithdrawalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let w;
  try {
    w = await AdminAPI.botWithdrawal(Number(id));
  } catch {
    notFound();
  }

  const meta = STATUS[w.status] ?? STATUS.pending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/bot-withdrawals"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Bot yechishlari
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Pul yechish #{w.id}</CardTitle>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </CardHeader>
        <CardContent>
          <Row label="Foydalanuvchi" value={w.user_phone ?? `#${w.user}`} />
          <Row label="Bot" value={w.project_name ?? "—"} />
          <Row label="Miqdor" value={<span className="font-mono">{w.amount} so&apos;m</span>} />
          <Row label="Karta raqami" value={<span className="whitespace-nowrap font-mono">{w.card_number}</span>} />
          <Row label="Karta egasi" value={<span className="whitespace-nowrap">{w.card_owner}</span>} />
          <Row label="Sana" value={fmtDate(w.created_at)} />
          {w.status === "rejected" && w.rejection_reason && (
            <Row label="Rad etish sababi" value={<span className="text-destructive">{w.rejection_reason}</span>} />
          )}
        </CardContent>
      </Card>

      {w.status === "pending" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Qaror</CardTitle>
          </CardHeader>
          <CardContent>
            <BotWithdrawalActions id={w.id} />
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
