"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { format, parseISO } from "date-fns";

type DayCount = { day: string; count: number };

type Props = {
  dailySignups: DayCount[];
  dailyOrders: DayCount[];
};

function formatDay(day: string) {
  try {
    return format(parseISO(day), "dd/MM");
  } catch {
    return day;
  }
}

export function DashboardCharts({ dailySignups, dailyOrders }: Props) {
  const signupData = dailySignups.map((d) => ({ ...d, label: formatDay(d.day) }));
  const orderData = dailyOrders.map((d) => ({ ...d, label: formatDay(d.day) }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Kunlik ro&apos;yxatdan o&apos;tishlar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={signupData}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0 / 50%)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(v) => `Sana: ${v}`}
                formatter={(v: number) => [v, "Ro'yxat"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="oklch(0.488 0.243 264.376)"
                fill="url(#signupGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Kunlik buyurtmalar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0 / 50%)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                labelFormatter={(v) => `Sana: ${v}`}
                formatter={(v: number) => [v, "Buyurtma"]}
              />
              <Bar dataKey="count" fill="oklch(0.488 0.243 264.376)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
