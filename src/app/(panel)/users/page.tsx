import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { UsersFilter } from "@/features/users/users-filter";
import { format } from "date-fns";

type SearchParams = {
  search?: string;
  role?: string;
  is_active?: string;
  page?: string;
};

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result;
  try {
    result = await AdminAPI.users({
      search: sp.search,
      role: sp.role,
      is_active: sp.is_active,
      page,
    });
  } catch {
    result = null;
  }

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.role) params.set("role", sp.role);
    if (sp.is_active) params.set("is_active", sp.is_active);
    params.set("page", String(p));
    return `/users?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
        <p className="text-muted-foreground text-sm">
          {result ? `Jami: ${result.total_items}` : ""}
        </p>
      </div>

      <UsersFilter defaultSearch={sp.search} defaultRole={sp.role} defaultIsActive={sp.is_active} />

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
          emptyMessage="Foydalanuvchilar topilmadi"
          columns={[
            {
              key: "id",
              header: "ID",
              cell: (u) => (
                <Link href={`/users/${u.id}`} className="text-primary hover:underline font-mono text-xs">
                  #{u.id}
                </Link>
              ),
            },
            {
              key: "phone",
              header: "Telefon",
              cell: (u) => (
                <Link href={`/users/${u.id}`} className="hover:underline text-sm">
                  {u.phone}
                </Link>
              ),
            },
            {
              key: "name",
              header: "Ism",
              cell: (u) =>
                [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "—",
            },
            {
              key: "role",
              header: "Rol",
              cell: (u) => <Badge variant="secondary">{u.role || "user"}</Badge>,
            },
            {
              key: "balance",
              header: "Balans",
              cell: (u) => <span className="font-mono text-sm">{u.balance}</span>,
            },
            {
              key: "status",
              header: "Holat",
              cell: (u) => (
                <Badge variant={u.is_active ? "success" : "destructive"}>
                  {u.is_active ? "Faol" : "Bloklangan"}
                </Badge>
              ),
            },
            {
              key: "date_joined",
              header: "Ro'yxat sanasi",
              cell: (u) => (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(u.date_joined), "dd.MM.yyyy")}
                </span>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
