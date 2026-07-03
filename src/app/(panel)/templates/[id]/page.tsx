import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AdminAPI, AdminTemplateDetail } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { VerifyToggle } from "@/features/templates/verify-toggle";
import { TemplateEditDialog } from "@/features/templates/template-edit-dialog";
import { DeleteTemplateButton } from "@/features/templates/delete-template-button";
import { format } from "date-fns";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return value;
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let template: AdminTemplateDetail;
  try {
    template = await AdminAPI.template(id);
  } catch {
    notFound();
  }

  let categories: { id: string; name: string }[] = [];
  try {
    categories = await AdminAPI.templateCategories();
  } catch {
    // degraded gracefully — edit dialog just won't offer category picking
  }

  const price = template.original_price ? Number(template.original_price) : null;
  const discount = template.discount ? Number(template.discount) : null;
  // Ko'p muallif faqat Telegram orqali kirgan — phone bo'sh bo'lishi mumkin,
  // shu holda ism (author_name) ko'rsatiladi.
  const authorLabel =
    template.author_phone || template.author_name || (template.author_id ? `#${template.author_id}` : null);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/templates"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Shablonlar
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {template.image && (
            <Image
              src={template.image}
              alt={template.name}
              width={56}
              height={56}
              className="rounded-lg object-cover w-14 h-14 flex-shrink-0"
              unoptimized
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground text-sm font-mono">
              {template.slug ? `/${template.slug}` : `#${template.id}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge variant={template.is_verify ? "success" : "warn"}>
            {template.is_verify ? "Tasdiqlangan" : "Kutilmoqda"}
          </Badge>
          <TemplateEditDialog template={template} categories={categories} />
          <VerifyToggle id={template.id} isVerify={template.is_verify} name={template.name} />
          <DeleteTemplateButton id={template.id} name={template.name} />
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
            <dd className="font-mono col-span-2">#{template.id}</dd>

            <dt className="text-muted-foreground">Nomi</dt>
            <dd className="col-span-2 font-medium">{template.name}</dd>

            <dt className="text-muted-foreground">Slug</dt>
            <dd className="col-span-2 font-mono">{template.slug || "—"}</dd>

            <dt className="text-muted-foreground">Qisqa tavsif</dt>
            <dd className="col-span-2">{template.short_description || "—"}</dd>

            <dt className="text-muted-foreground">Tavsif</dt>
            <dd className="col-span-2 whitespace-pre-wrap">{template.description || "—"}</dd>

            <dt className="text-muted-foreground">Demo URL</dt>
            <dd className="col-span-2">
              {template.demo_url ? (
                <a
                  href={template.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {template.demo_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                "—"
              )}
            </dd>

            <dt className="text-muted-foreground">Narx</dt>
            <dd className="col-span-2 font-mono font-medium">
              {price !== null ? formatCurrency(price) : "—"}
            </dd>

            <dt className="text-muted-foreground">Chegirma</dt>
            <dd className="col-span-2">
              {discount !== null && discount > 0 ? (
                <span className="font-mono">
                  {discount}
                  {template.discount_type === "percent" ? "%" : " so'm"}
                </span>
              ) : (
                "—"
              )}
            </dd>

            <dt className="text-muted-foreground">Tasdiq holati</dt>
            <dd className="col-span-2">
              <Badge variant={template.is_verify ? "success" : "warn"}>
                {template.is_verify ? "Tasdiqlangan" : "Kutilmoqda"}
              </Badge>
            </dd>

            <dt className="text-muted-foreground">Muallif</dt>
            <dd className="col-span-2">
              {template.author_id ? (
                <Link
                  href={`/users/${template.author_id}`}
                  className="text-primary hover:underline"
                >
                  {authorLabel}
                </Link>
              ) : (
                "—"
              )}
            </dd>

            <dt className="text-muted-foreground">Loyiha</dt>
            <dd className="col-span-2">
              {template.project_id ? (
                <Link href={`/projects/${template.project_id}`} className="text-primary hover:underline font-mono">
                  #{template.project_id}
                </Link>
              ) : (
                "—"
              )}
            </dd>

            <dt className="text-muted-foreground">Yaratilgan</dt>
            <dd className="col-span-2">{formatDate(template.created_at)}</dd>

            <dt className="text-muted-foreground">Yangilangan</dt>
            <dd className="col-span-2">{formatDate(template.updated_at)}</dd>
          </dl>
        </CardContent>
      </Card>

      {/* Kategoriyalar va imkoniyatlar */}
      {(template.categories.length > 0 || template.features.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Kategoriyalar &amp; Imkoniyatlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.categories.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Kategoriyalar
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.categories.map((c) => (
                    <Badge key={c.id} variant="secondary">{c.name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {template.features.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Imkoniyatlar
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.features.map((f) => (
                    <Badge key={f.id} variant="outline">{f.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistika */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Statistika</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <dt className="text-muted-foreground">Ko&apos;rishlar</dt>
            <dd className="col-span-2 font-medium tabular-nums">
              {(template.views ?? 0).toLocaleString("uz-UZ")}
            </dd>

            <dt className="text-muted-foreground">Yoqtirishlar</dt>
            <dd className="col-span-2 font-medium tabular-nums">
              {(template.likes_count ?? 0).toLocaleString("uz-UZ")}
            </dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
