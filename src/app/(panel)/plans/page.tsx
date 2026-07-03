import { AdminAPI } from "@/shared/api/services";
import { Badge } from "@/shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { PlanFormDialog } from "@/features/plans/plan-form-dialog";
import { DeletePlanButton } from "@/features/plans/delete-plan-button";
import { formatCurrency } from "@/shared/lib/utils";

export default async function PlansPage() {
  let plans;
  try {
    plans = await AdminAPI.plans();
  } catch {
    plans = null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tariflar</h1>
          <p className="text-muted-foreground text-sm">Tarif rejalarini boshqarish</p>
        </div>
        <PlanFormDialog />
      </div>

      {plans === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Ma&apos;lumotlarni yuklashda xatolik
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">
          Tariflar mavjud emas. Yangi tarif qo&apos;shing.
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead>Narxi</TableHead>
                <TableHead>Max bot</TableHead>
                <TableHead>Oylik token</TableHead>
                <TableHead>Top</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead>Tartib</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(parseFloat(plan.price))}</TableCell>
                  <TableCell>{plan.max_bots === 0 ? "cheksiz" : plan.max_bots}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {((plan.max_input_tokens ?? 0) + (plan.max_output_tokens ?? 0)).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {plan.is_top && <Badge variant="default">Top</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? "success" : "secondary"}>
                      {plan.is_active ? "Faol" : "Nofaol"}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan.order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <PlanFormDialog plan={plan} />
                      <DeletePlanButton id={plan.id} name={plan.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
