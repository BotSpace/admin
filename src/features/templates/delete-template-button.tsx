"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTemplateAction } from "./actions";

export function DeleteTemplateButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    const res = await deleteTemplateAction(id);
    setLoading(false);
    if (res.ok) {
      toast.success("Shablon o'chirildi");
      router.push("/templates");
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="destructive" size="sm" className="gap-1.5" disabled={loading}>
          <Trash2 className="h-3.5 w-3.5" />
          O&apos;chirish
        </Button>
      }
      title="Shablonni o'chirish"
      description={`"${name}" shabloni BUTUNLAY o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.`}
      confirmLabel="O'chirish"
      variant="destructive"
      onConfirm={handle}
    />
  );
}
