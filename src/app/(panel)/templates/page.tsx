import Link from "next/link";
import Image from "next/image";
import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { VerifyToggle } from "@/features/templates/verify-toggle";
import { TemplatesFilter } from "@/features/templates/templates-filter";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

type SearchParams = {
  search?: string;
  is_verify?: string;
  category?: string;
  price_min?: string;
  price_max?: string;
  created_after?: string;
  created_before?: string;
  ordering?: string;
  page?: string;
};

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let categories: { id: string; name: string }[] = [];
  try {
    categories = await AdminAPI.templateCategories();
  } catch {
    // degraded gracefully
  }

  let result;
  try {
    result = await AdminAPI.templates({
      search: sp.search,
      is_verify: sp.is_verify,
      category: sp.category,
      price_min: sp.price_min,
      price_max: sp.price_max,
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
    if (sp.is_verify) params.set("is_verify", sp.is_verify);
    if (sp.category) params.set("category", sp.category);
    if (sp.price_min) params.set("price_min", sp.price_min);
    if (sp.price_max) params.set("price_max", sp.price_max);
    if (sp.created_after) params.set("created_after", sp.created_after);
    if (sp.created_before) params.set("created_before", sp.created_before);
    if (sp.ordering) params.set("ordering", sp.ordering);
    params.set("page", String(p));
    return `/templates?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Shablonlar</h1>
          <p className="text-muted-foreground text-sm">
            {result ? `Jami: ${result.total_items}` : ""}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/templates/new">
            <Plus className="h-4 w-4 mr-1" />
            Yangi template
          </Link>
        </Button>
      </div>

      <TemplatesFilter
        defaultSearch={sp.search}
        defaultIsVerify={sp.is_verify}
        defaultCategory={sp.category}
        defaultPriceMin={sp.price_min}
        defaultPriceMax={sp.price_max}
        defaultCreatedAfter={sp.created_after}
        defaultCreatedBefore={sp.created_before}
        defaultOrdering={sp.ordering}
        categories={categories}
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
          emptyMessage="Shablonlar topilmadi"
          columns={[
            {
              key: "image",
              header: "",
              cell: (t) =>
                t.image ? (
                  <Link href={`/templates/${t.id}`}>
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="rounded object-cover w-10 h-10"
                      unoptimized
                    />
                  </Link>
                ) : (
                  <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                    —
                  </div>
                ),
            },
            {
              key: "name",
              header: "Nomi",
              cell: (t) => (
                <Link
                  href={`/templates/${t.id}`}
                  className="hover:underline text-sm font-medium"
                >
                  {t.name}
                </Link>
              ),
            },
            {
              key: "author",
              header: "Muallif",
              cell: (t) => {
                // Ko'p foydalanuvchi faqat Telegram orqali kirgan — phone
                // bo'sh bo'lishi mumkin, shu holda ism (author_name) ko'rsatiladi.
                const label =
                  t.author_phone || t.author_name || (t.author_id ? `#${t.author_id}` : "—");
                return t.author_id ? (
                  <Link
                    href={`/users/${t.author_id}`}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">{label}</span>
                );
              },
            },
            {
              key: "verify",
              header: "Tasdiqlangan",
              cell: (t) => (
                <Badge variant={t.is_verify ? "success" : "warn"}>
                  {t.is_verify ? "Ha" : "Kutmoqda"}
                </Badge>
              ),
            },
            {
              key: "views",
              header: "Ko'rishlar",
              cell: (t) => (
                <span className="text-sm tabular-nums">
                  {(t.views ?? 0).toLocaleString("uz-UZ")}
                </span>
              ),
            },
            {
              key: "price",
              header: "Narxi",
              cell: (t) => (
                <span className="font-mono text-sm">
                  {t.original_price
                    ? formatCurrency(Number(t.original_price))
                    : "—"}
                </span>
              ),
            },
            {
              key: "created",
              header: "Yaratilgan",
              cell: (t) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(t.created_at), "dd.MM.yyyy")}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              cell: (t) => <VerifyToggle id={t.id} isVerify={t.is_verify} name={t.name} />,
            },
          ]}
        />
      )}
    </div>
  );
}
