import type { BotAnalytics } from "@/shared/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatActivity, formatCount } from "./monitoring-utils";

export function BotAnalyticsCard({ statistics, aggregate = false }: {
  statistics: BotAnalytics | null;
  aggregate?: boolean;
}) {
  const metrics = [
    ["Jami bot foydalanuvchilari", statistics?.users_total],
    ["Faol foydalanuvchilar (24 soat)", statistics?.active_users_24h],
    ["Faol foydalanuvchilar (7 kun)", statistics?.active_users_7d],
    ["Faollik (24 soat)", statistics?.messages_24h],
  ] as const;
  return (
    <Card>
      <CardHeader><CardTitle>Bot statistikasi</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {!statistics && <p role="status" className="text-sm text-amber-700 dark:text-amber-300">Bot statistikasi hozir mavjud emas. Qayta yuklab ko&apos;ring.</p>}
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-xl font-semibold tabular-nums">{formatCount(value)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm">Oxirgi faollik (UTC): {statistics ? formatActivity(statistics.last_activity_at) : "—"}</p>
        <p className="text-xs text-muted-foreground">
          {aggregate
            ? "Foydalanuvchilar — har bir botdagi noyob foydalanuvchilar yig'indisi; bir kishi bir nechta botda sanalishi mumkin. "
            : "Foydalanuvchilar — saqlangan tarixdagi noyob kiruvchi foydalanuvchilar. "}
          Faollik — oxirgi 24 soatdagi kiruvchi va chiquvchi hodisalar (callback ham kiradi).
          O&apos;chirilgan tarix foydalanuvchilar sonini kamaytirishi mumkin.
        </p>
      </CardContent>
    </Card>
  );
}
