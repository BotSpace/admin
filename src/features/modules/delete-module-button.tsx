"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { deleteModuleAction } from "./actions";

type Props = {
  slug: string;
  name: string;
  /** detail sahifasida o'chirishdan keyin /modules ga redirect */
  redirectAfter?: boolean;
};

export function DeleteModuleButton({ slug, name, redirectAfter }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function handle() {
    const res = await deleteModuleAction(slug);
    if (res.ok) {
      toast.success("Modul o'chirildi");
      if (redirectAfter) {
        startTransition(() => router.push("/modules"));
      }
    } else {
      toast.error(res.message);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title={`"${name}" modulini o'chirish`}
      description="Bu modul o'chirilsa barcha unga bog'liq sozlamalar ham o'chiriladi. Davom etasizmi?"
      confirmLabel="O'chirish"
      variant="destructive"
      onConfirm={handle}
    />
  );
}
