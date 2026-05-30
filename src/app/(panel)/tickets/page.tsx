import { AdminAPI } from "@/shared/api/services";
import { Ticket } from "lucide-react";

export default async function TicketsPage() {
  let result;
  try {
    result = await AdminAPI.tickets();
  } catch {
    result = null;
  }

  const detail =
    (result as { detail?: string } | null)?.detail ??
    "Ticket tizimi hali sozlanmagan";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ticketlar</h1>
        <p className="text-muted-foreground text-sm">Foydalanuvchi so&apos;rovlari</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 p-16 text-center gap-4">
        <Ticket className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm max-w-sm">{detail}</p>
      </div>
    </div>
  );
}
