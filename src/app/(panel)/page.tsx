import { AdminAPI } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DashboardCharts } from "@/features/dashboard/dashboard-charts";
import { formatCurrency } from "@/shared/lib/utils";
import { Users, FolderOpen, PackageCheck, Wallet, Banknote, UserCheck } from "lucide-react";

export default async function DashboardPage() {
  let stats;
  try {
    stats = await AdminAPI.stats();
  } catch {
    stats = null;
  }

  const kpis = stats
    ? [
        {
          label: "Jami foydalanuvchilar",
          value: stats.users.total,
          sub: `+${stats.users.new_today} bugun · +${stats.users.new_7d} 7 kunda`,
          icon: <Users className="h-5 w-5 text-muted-foreground" />,
        },
        {
          label: "Faol foydalanuvchilar",
          value: stats.users.active,
          sub: `+${stats.users.new_30d} 30 kunda`,
          icon: <UserCheck className="h-5 w-5 text-muted-foreground" />,
        },
        {
          label: "Jami loyihalar",
          value: stats.projects.total,
          sub: `${stats.projects.with_release} tasi reliz qilingan`,
          icon: <FolderOpen className="h-5 w-5 text-muted-foreground" />,
        },
        {
          label: "Shablonlar",
          value: stats.templates.total,
          sub: `${stats.templates.pending_verify} ta tasdiqlashda`,
          icon: <PackageCheck className="h-5 w-5 text-muted-foreground" />,
        },
        {
          label: "Kutilayotgan yechishlar",
          value: stats.withdrawals.pending,
          sub: "",
          icon: <Wallet className="h-5 w-5 text-muted-foreground" />,
        },
        {
          label: "Daromad (30 kun)",
          value: formatCurrency(Number(stats.revenue_30d)),
          sub: "",
          icon: <Banknote className="h-5 w-5 text-muted-foreground" />,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Boshqaruv paneli</h1>
        <p className="text-muted-foreground text-sm">Tizim holati va statistika</p>
      </div>

      {stats === null && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Statistikani yuklashda xatolik. API bilan aloqa yo&apos;q.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {stats && <DashboardCharts dailySignups={stats.daily_signups} dailyOrders={stats.daily_orders} />}
    </div>
  );
}
