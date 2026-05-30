import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { ProjectsFilter } from "@/features/projects/projects-filter";
import { format } from "date-fns";

type SearchParams = { search?: string; page?: string };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.projects({ search: sp.search, page });
  } catch {
    result = null;
  }

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    params.set("page", String(p));
    return `/projects?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Loyihalar</h1>
        <p className="text-muted-foreground text-sm">{result ? `Jami: ${result.total_items}` : ""}</p>
      </div>

      <ProjectsFilter defaultSearch={sp.search} />

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
            { key: "id", header: "ID", cell: (p) => <span className="font-mono text-xs">#{p.id}</span> },
            { key: "name", header: "Nomi", cell: (p) => p.name },
            { key: "owner", header: "Egasi", cell: (p) => p.owner_phone ?? `#${p.owner}` },
            {
              key: "release",
              header: "Reliz",
              cell: (p) => (
                <Badge variant={p.has_release ? "success" : "secondary"}>
                  {p.has_release ? "Ha" : "Yo'q"}
                </Badge>
              ),
            },
            {
              key: "active",
              header: "Holat",
              cell: (p) => (
                <Badge variant={p.is_active ? "success" : "destructive"}>
                  {p.is_active ? "Faol" : "Nofaol"}
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
