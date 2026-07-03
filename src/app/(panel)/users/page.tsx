import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { DataTable } from "@/shared/components/data-table";
import { Badge } from "@/shared/components/ui/badge";
import { UsersFilter } from "@/features/users/users-filter";
import { format } from "date-fns";
import { formatCurrency } from "@/shared/lib/utils";

type SearchParams = {
  search?: string;
  role?: string;
  is_active?: string;
  is_staff?: string;
  plan?: string;
  joined_after?: string;
  joined_before?: string;
  balance_min?: string;
  balance_max?: string;
  ordering?: string;
  page?: string;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let plans: { name: string; display: string }[] = [];
  try {
    const raw = await AdminAPI.plans();
    plans = raw.map((p) => ({ name: p.name, display: p.name }));
  } catch {
    // plans filter degraded gracefully
  }

  let result;
  try {
    result = await AdminAPI.users({
      search: sp.search,
      role: sp.role,
      is_active: sp.is_active,
      is_staff: sp.is_staff,
      plan: sp.plan,
      joined_after: sp.joined_after,
      joined_before: sp.joined_before,
      balance_min: sp.balance_min,
      balance_max: sp.balance_max,
      ordering: sp.ordering,
      page,
    });
  } catch {
    result = null;
  }

  function buildPageHref(p: number): string {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.role) params.set("role", sp.role);
    if (sp.is_active) params.set("is_active", sp.is_active);
    if (sp.is_staff) params.set("is_staff", sp.is_staff);
    if (sp.plan) params.set("plan", sp.plan);
    if (sp.joined_after) params.set("joined_after", sp.joined_after);
    if (sp.joined_before) params.set("joined_before", sp.joined_before);
    if (sp.balance_min) params.set("balance_min", sp.balance_min);
    if (sp.balance_max) params.set("balance_max", sp.balance_max);
    if (sp.ordering) params.set("ordering", sp.ordering);
    params.set("page", String(p));
    return `/users?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
        <p className="text-muted-foreground text-sm">
          {result ? `Jami: ${result.total_items}` : ""}
        </p>
      </div>

      <UsersFilter
        defaultSearch={sp.search}
        defaultRole={sp.role}
        defaultIsActive={sp.is_active}
        defaultIsStaff={sp.is_staff}
        defaultPlan={sp.plan}
        defaultJoinedAfter={sp.joined_after}
        defaultJoinedBefore={sp.joined_before}
        defaultBalanceMin={sp.balance_min}
        defaultBalanceMax={sp.balance_max}
        defaultOrdering={sp.ordering}
        plans={plans}
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
          emptyMessage="Foydalanuvchilar topilmadi"
          columns={[
            {
              key: "id",
              header: "ID",
              cell: (u) => (
                <Link
                  href={`/users/${u.id}`}
                  className="text-primary hover:underline font-mono text-xs"
                >
                  #{u.id}
                </Link>
              ),
            },
            {
              key: "phone",
              header: "Telefon / Email",
              cell: (u) => {
                // Telegram orqali kirganlarda telefon (ba'zan email ham) yo'q
                // bo'ladi — bunday holda ism-familiyaga tushamiz, qator bo'sh
                // qolmasin.
                const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ");
                const label = u.phone || u.email || fullName || u.username || "—";
                return (
                  <Link href={`/users/${u.id}`} className="hover:underline text-sm">
                    {label}
                  </Link>
                );
              },
            },
            {
              key: "name",
              header: "Ism",
              cell: (u) =>
                [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                u.username ||
                "—",
            },
            {
              key: "role",
              header: "Rol",
              cell: (u) => (
                <Badge variant="secondary">{u.role || "user"}</Badge>
              ),
            },
            {
              key: "balance",
              header: "Balans",
              cell: (u) => (
                <span className="font-mono text-sm">
                  {formatCurrency(u.balance)}
                </span>
              ),
            },
            {
              key: "tokens_used_total",
              header: "Tokenlar",
              cell: (u) => (
                <span className="font-mono text-sm">
                  {(u.tokens_used_total ?? 0).toLocaleString("uz-UZ")}
                </span>
              ),
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
