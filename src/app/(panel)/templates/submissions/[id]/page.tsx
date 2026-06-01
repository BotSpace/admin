import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { SubmissionActions } from "@/features/templates/submission-actions";
import { SubmissionEditDialog } from "@/features/templates/submission-edit-dialog";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return value;
  }
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

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let submission;
  try {
    submission = await AdminAPI.submission(Number(id));
  } catch {
    notFound();
  }

  const displayName = submission.name || submission.template_name || "—";
  const displayUser = submission.user_phone || submission.submitted_by_phone || "—";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/templates/submissions"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Tasdiqlash so&apos;rovlari
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-muted-foreground text-sm font-mono">#{submission.id}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariant(submission.status)}>
            {statusLabel(submission.status)}
          </Badge>
          <SubmissionEditDialog submission={submission} />
          {submission.status === "pending" && (
            <SubmissionActions id={submission.id} />
          )}
        </div>
      </div>

      {/* Asosiy ma'lumotlar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Asosiy ma&apos;lumotlar</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <dt className="text-muted-foreground">ID</dt>
            <dd className="font-mono col-span-2">#{submission.id}</dd>

            <dt className="text-muted-foreground">Nomi</dt>
            <dd className="col-span-2 font-medium">{displayName}</dd>

            <dt className="text-muted-foreground">Foydalanuvchi</dt>
            <dd className="col-span-2">{displayUser}</dd>

            <dt className="text-muted-foreground">Loyiha</dt>
            <dd className="col-span-2">{submission.project_name || "—"}</dd>

            <dt className="text-muted-foreground">Holat</dt>
            <dd className="col-span-2">
              <Badge variant={statusVariant(submission.status)}>
                {statusLabel(submission.status)}
              </Badge>
            </dd>

            {submission.note && (
              <>
                <dt className="text-muted-foreground">Izoh</dt>
                <dd className="col-span-2">{submission.note}</dd>
              </>
            )}

            <dt className="text-muted-foreground">Yuborilgan</dt>
            <dd className="col-span-2">{formatDate(submission.created_at)}</dd>

            {submission.updated_at && (
              <>
                <dt className="text-muted-foreground">Yangilangan</dt>
                <dd className="col-span-2">{formatDate(submission.updated_at)}</dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Tavsif */}
      {submission.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Tavsif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{submission.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Kategoriyalar va imkoniyatlar */}
      {((submission.categories?.length ?? 0) > 0 || (submission.features?.length ?? 0) > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Kategoriyalar &amp; Imkoniyatlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.categories && submission.categories.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Kategoriyalar
                </p>
                <div className="flex flex-wrap gap-2">
                  {submission.categories.map((c) => (
                    <Badge key={c.id} variant="secondary">{c.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {submission.features && submission.features.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Imkoniyatlar
                </p>
                <div className="flex flex-wrap gap-2">
                  {submission.features.map((f) => (
                    <Badge key={f.id} variant="outline">{f.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
