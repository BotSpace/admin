import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminAPI, AdminTransactionDetail } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd.MM.yyyy HH:mm");
  } catch {
    return value;
  }
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let transaction: AdminTransactionDetail;
  try {
    transaction = await AdminAPI.transaction(Number(id));
  } catch {
    notFound();
  }

  const amount = Number(transaction.amount);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Tranzaksiyalar
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">#{transaction.id}</h1>
          <p className="text-muted-foreground text-sm">
            {formatCurrency(amount)}
          </p>
        </div>
        <Badge variant={transaction.status ? "success" : "destructive"}>
          {transaction.status ? "To'langan" : "To'lanmagan"}
        </Badge>
      </div>

      {/* Asosiy ma'lumotlar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Tranzaksiya ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <dt className="text-muted-foreground">ID</dt>
            <dd className="font-mono col-span-2">#{transaction.id}</dd>

            <dt className="text-muted-foreground">Summa</dt>
            <dd className="col-span-2 font-mono font-medium text-base">
              {formatCurrency(amount)}
            </dd>

            <dt className="text-muted-foreground">Holat</dt>
            <dd className="col-span-2">
              <Badge variant={transaction.status ? "success" : "destructive"}>
                {transaction.status ? "To'langan" : "To'lanmagan"}
              </Badge>
            </dd>

            <dt className="text-muted-foreground">Foydalanuvchi</dt>
            <dd className="col-span-2">
              {transaction.user_id ? (
                <Link
                  href={`/users/${transaction.user_id}`}
                  className="text-primary hover:underline"
                >
                  {transaction.user_phone ?? `#${transaction.user_id}`}
                </Link>
              ) : transaction.user_phone ? (
                transaction.user_phone
              ) : transaction.user ? (
                <Link
                  href={`/users/${transaction.user}`}
                  className="text-primary hover:underline"
                >
                  #{transaction.user}
                </Link>
              ) : (
                "—"
              )}
            </dd>

            <dt className="text-muted-foreground">Idempotency kalit</dt>
            <dd className="col-span-2 font-mono text-xs break-all">
              {transaction.idempotency_key || "—"}
            </dd>

            <dt className="text-muted-foreground">Yaratilgan</dt>
            <dd className="col-span-2">{formatDate(transaction.created_at)}</dd>

            <dt className="text-muted-foreground">Yangilangan</dt>
            <dd className="col-span-2">{formatDate(transaction.updated_at)}</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
