"use client";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatTimestamp } from "./monitoring-utils";

/** Bir chiziqli Area chart uchun series formati. */
type SingleSeries = {
  kind: "single";
  data: [number, number][];
  color?: string;
  formatValue?: (v: number) => string;
};

/** Ikki chiziqli Line chart uchun series formati (masalan rx + tx). */
type DoubleSeries = {
  kind: "double";
  data1: [number, number][];
  data2: [number, number][];
  label1: string;
  label2: string;
  color1?: string;
  color2?: string;
  formatValue?: (v: number) => string;
};

type Props = {
  title: string;
  series: SingleSeries | DoubleSeries;
  height?: number;
  /** Agar range >= 24h bo'lsa sana ham ko'rinadi. */
  showDate?: boolean;
};

function buildSingleData(raw: [number, number][], showDate: boolean) {
  return raw.map(([ts, val]) => ({ ts, val, label: formatTimestamp(ts, showDate) }));
}

const PRIMARY = "oklch(0.488 0.243 264.376)";
const SECONDARY = "oklch(0.627 0.194 154.9)";

export function MetricChart({ title, series, height = 220, showDate = false }: Props) {
  if (series.kind === "single") {
    const chartData = buildSingleData(series.data, showDate);
    const color = series.color ?? PRIMARY;
    const gradId = `grad_${title.replace(/\s+/g, "_")}`;

    if (chartData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{ height }}
              className="flex items-center justify-center text-sm text-muted-foreground"
            >
              Ma&apos;lumot yo&apos;q
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0 / 50%)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={series.formatValue ?? ((v: number) => String(v))}
                width={70}
              />
              <Tooltip
                contentStyle={{ fontSize: 11 }}
                labelFormatter={(v) => `Vaqt: ${v}`}
                formatter={(v: number) => [
                  series.formatValue ? series.formatValue(v) : v,
                  title,
                ]}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke={color}
                fill={`url(#${gradId})`}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  // DoubleSeries — LineChart
  const merged: { ts: number; label: string; val1?: number; val2?: number }[] = [];
  const tsMap = new Map<number, { val1?: number; val2?: number }>();
  for (const [ts, val] of series.data1) {
    tsMap.set(ts, { ...(tsMap.get(ts) ?? {}), val1: val });
  }
  for (const [ts, val] of series.data2) {
    tsMap.set(ts, { ...(tsMap.get(ts) ?? {}), val2: val });
  }
  for (const [ts, vals] of Array.from(tsMap.entries()).sort((a, b) => a[0] - b[0])) {
    merged.push({ ts, label: formatTimestamp(ts, showDate), ...vals });
  }

  const color1 = series.color1 ?? PRIMARY;
  const color2 = series.color2 ?? SECONDARY;

  if (merged.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{ height }}
            className="flex items-center justify-center text-sm text-muted-foreground"
          >
            Ma&apos;lumot yo&apos;q
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0 / 50%)" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={series.formatValue ?? ((v: number) => String(v))}
              width={70}
            />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              labelFormatter={(v) => `Vaqt: ${v}`}
              formatter={(v: number, name: string) => [
                series.formatValue ? series.formatValue(v) : v,
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="val1"
              name={series.label1}
              stroke={color1}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="val2"
              name={series.label2}
              stroke={color2}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
