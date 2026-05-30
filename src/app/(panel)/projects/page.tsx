import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { ProjectsFilter } from "@/features/projects/projects-filter";
import { format } from "date-fns";

type SearchParams = {
  search?: string;
  is_template?: string;
  has_release?: string;
  created_after?: string;
  created_before?: string;
  ordering?: string;
  page?: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.projects({
      search: sp.search,
      is_template: sp.is_template,
      has_release: sp.has_release,
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
    if (sp.is_template) params.set("is_template", sp.is_template);
    if (sp.has_release) params.set("has_release", sp.has_release);
    if (sp.created_after) params.set("created_after", sp.created_after);
    if (sp.created_before) params.set("created_before", sp.created_before);
    if (sp.ordering) params.set("ordering", sp.ordering);
    params.set("page", String(p));
    return `/projects?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Loyihalar</h1>
        <p className="text-muted-foreground text-sm">
          {result ? `Jami: ${result.total_items}` : ""}
        </p>
      </div>

      <ProjectsFilter
        defaultSearch={sp.search}
        defaultIsTemplate={sp.is_template}
        defaultHasRelease={sp.has_release}
        defaultCreatedAfter={sp.created_after}
        defaultCreatedBefore={sp.created_before}
        defaultOrdering={sp.ordering}
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
          emptyMessage="Loyihalar topilmadi"
          columns={[
            {
              key: "id",
              header: "ID",
              cell: (p) => (
                <Link
                  href={`/projects/${p.id}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  #{p.id}
                </Link>
              ),
            },
            {
              key: "name",
              header: "Nomi",
              cell: (p) => (
                <Link
                  href={`/projects/${p.id}`}
                  className="hover:underline text-sm font-medium"
                >
                  {p.name}
                </Link>
              ),
            },
            {
              key: "owner",
              header: "Egasi",
              cell: (p) => (
                <span className="text-sm text-muted-foreground">
                  {p.owner_phone ?? `#${p.owner}`}
                </span>
              ),
            },
            {
              key: "is_template",
              header: "Turi",
              cell: (p) => (
                <Badge variant={p.is_template ? "secondary" : "outline"}>
                  {p.is_template ? "Shablon" : "Oddiy"}
                </Badge>
              ),
            },
            {
              key: "created",
              header: "Yaratilgan",
              cell: (p) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(p.created_at), "dd.MM.yyyy")}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              cell: (p) => <DeleteProjectButton id={p.id} name={p.name} />,
            },
          ]}
        />
      )}
    </div>
  );
}
