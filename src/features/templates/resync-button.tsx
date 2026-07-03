"use client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import { RefreshCw } from "lucide-react";
import { resyncTemplateAction } from "./actions";

export function ResyncButton({ id }: { id: string }) {
  async function handle() {
    const res = await resyncTemplateAction(id);
    if (res.ok) {
      toast.success("Shablon tarkibi loyihadan qayta yuklandi");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          Loyihadan yangilash
        </Button>
      }
      title="Loyihadan qayta snapshot"
      description="Tarkib (flow, kolleksiyalar, kredensialar, modullar, envlar) bog'liq loyihadan qayta yuklanadi. Mavjud spec o'zgartirishlar almashtiriladi. Davom etasizmi?"
      confirmLabel="Yangilash"
      variant="default"
      onConfirm={handle}
    />
  );
}
