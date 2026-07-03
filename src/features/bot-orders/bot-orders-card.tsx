import { format } from "date-fns";
import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatCurrency } from "@/shared/lib/utils";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return value;
  }
}

const STATUS_VARIANT: Record<string, "success" | "warn" | "destructive" | "secondary"> = {
  paid: "success",
  created: "warn",
  pending: "warn",
  failed: "destructive",
  cancelled: "destructive",
  canceled: "destructive",
};

/**
 * Botdan tushgan to'lovlar (PaymentOrderModel) ro'yxati. `project` berilsa —
 * shu botning to'lovlari; `owner` berilsa — foydalanuvchining barcha botlaridagi
 * to'lovlar. Server komponenti — o'zi backenddan oladi.
 */
export async function BotOrdersCard({
  project,
  owner,
  title = "Botdan tushgan to'lovlar",
}: {
  project?: string;
  owner?: string;
  title?: string;
}) {
  // Foydalanuvchi rejimida qaysi bot ekanini ko'rsatamiz; bot rejimida bot ma'lum.
  const showBot = owner != null && project == null;

  let total = 0;
  let orders: Awaited<ReturnType<typeof AdminAPI.botOrders>>["results"] = [];
  try {
    const page = await AdminAPI.botOrders({ project, owner, ordering: "-id" });
    orders = page.results;
    total = page.total_items;
  } catch {
    // bo'sh holatda chiqaramiz
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          {title}{" "}
          <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal">{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="px-6 py-4 text-sm text-muted-foreground">To&apos;lov yo&apos;q</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  {showBot && <TableHead>Bot</TableHead>}
                  <TableHead>To&apos;lovchi</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                  <TableHead className="text-right">Sof</TableHead>
                  <TableHead>Holat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(o.paid_at || o.created_at)}
                    </TableCell>
                    {showBot && (
                      <TableCell className="text-sm">{o.project_name || `#${o.project}`}</TableCell>
                    )}
                    <TableCell className="text-sm">
                      {o.payer_name || (o.payer_username ? `@${o.payer_username}` : "—")}
                      {o.payer_chat_id != null && (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          ({o.payer_chat_id})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(Number(o.amount))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(Number(o.net_amount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[o.status] ?? "secondary"}>{o.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {total > orders.length && (
              <p className="px-6 py-3 text-xs text-muted-foreground">
                Eng so&apos;nggi {orders.length} ta ko&apos;rsatildi (jami {total}).
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
