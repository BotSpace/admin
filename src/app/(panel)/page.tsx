import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { BotAnalyticsCard } from "@/features/monitoring/bot-analytics-card";
import { formatActivity, formatCount } from "@/features/monitoring/monitoring-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DashboardCharts } from "@/features/dashboard/dashboard-charts";
import { formatCurrency } from "@/shared/lib/utils";
import { Users, FolderOpen, PackageCheck, Wallet, Banknote, UserCheck } from "lucide-react";

export default async function DashboardPage({ searchParams }: {
  searchParams: Promise<{ bot_ordering?: string }>;
}) {
  const sp = await searchParams;
  const ordering = sp.bot_ordering === "users_desc" ? "users_desc" : "activity_desc";
  const [stats, bots] = await Promise.all([
    AdminAPI.stats().catch(() => null),
    AdminAPI.botStatistics(ordering, 20).catch(() => null),
  ]);

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

      <BotAnalyticsCard statistics={bots?.totals ?? null} aggregate />
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Top botlar</CardTitle>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/?bot_ordering=activity_desc" aria-current={ordering === "activity_desc" ? "page" : undefined} className={ordering === "activity_desc" ? "font-semibold text-primary" : "hover:underline"}>Faollik (24 soat) bo&apos;yicha</Link>
            <Link href="/?bot_ordering=users_desc" aria-current={ordering === "users_desc" ? "page" : undefined} className={ordering === "users_desc" ? "font-semibold text-primary" : "hover:underline"}>Foydalanuvchilar bo&apos;yicha</Link>
          </div>
          {bots && <p className="text-xs text-muted-foreground">Jami {formatCount(bots.projects_total)} loyiha. Top {bots.top_bots.length} ta; yuqoridagi jami ko&apos;rsatkichlar barcha loyihalarni qamrab oladi.</p>}
        </CardHeader>
        <CardContent>
          {!bots ? (
            <p role="status" className="text-sm text-muted-foreground">Botlar reytingini yuklab bo&apos;lmadi. Qayta yuklab ko&apos;ring.</p>
          ) : bots.top_bots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Botlar topilmadi.</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Bot</TableHead><TableHead>Foydalanuvchilar</TableHead>
                <TableHead>Faol (24s)</TableHead><TableHead>Faol (7 kun)</TableHead>
                <TableHead>Faollik (24s)</TableHead><TableHead>Oxirgi faollik (UTC)</TableHead>
              </TableRow></TableHeader>
              <TableBody>{bots.top_bots.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell><Link className="text-primary hover:underline" href={`/projects/${bot.id}`}>{bot.name}</Link>{bot.username && <p className="text-xs text-muted-foreground">@{bot.username}</p>}</TableCell>
                  <TableCell>{formatCount(bot.users_total)}</TableCell>
                  <TableCell>{formatCount(bot.active_users_24h)}</TableCell>
                  <TableCell>{formatCount(bot.active_users_7d)}</TableCell>
                  <TableCell>{formatCount(bot.messages_24h)}</TableCell>
                  <TableCell>{formatActivity(bot.last_activity_at)}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      {stats && <DashboardCharts dailySignups={stats.daily_signups} dailyOrders={stats.daily_orders} />}
    </div>
  );
}
