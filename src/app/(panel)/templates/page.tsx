import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { VerifyToggle } from "@/features/templates/verify-toggle";
import { TemplatesFilter } from "@/features/templates/templates-filter";
import { format } from "date-fns";

type SearchParams = { search?: string; is_verify?: string; page?: string };

export default async function TemplatesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.templates({ search: sp.search, is_verify: sp.is_verify, page });
  } catch {
    result = null;
  }

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.is_verify) params.set("is_verify", sp.is_verify);
    params.set("page", String(p));
    return `/templates?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shablonlar</h1>
        <p className="text-muted-foreground text-sm">{result ? `Jami: ${result.total_items}` : ""}</p>
      </div>

      <TemplatesFilter defaultSearch={sp.search} defaultIsVerify={sp.is_verify} />

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
            { key: "id", header: "ID", cell: (t) => <span className="font-mono text-xs">#{t.id}</span> },
            { key: "name", header: "Nomi", cell: (t) => t.name },
            { key: "author", header: "Muallif", cell: (t) => t.author_username ?? `#${t.author}` },
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
