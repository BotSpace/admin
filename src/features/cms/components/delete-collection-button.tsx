"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import { deleteCollectionAction } from "../actions";

export function DeleteCollectionButton({
  projectId,
  name,
  label,
}: {
  projectId: string;
  name: string;
  label?: string;
}) {
  const router = useRouter();

  async function handle() {
    const res = await deleteCollectionAction({ projectId, name });
    if (res.ok) {
      toast.success("Collection o'chirildi");
      router.push(`/projects/${projectId}/cms`);
      router.refresh();
    } else {
      toast.error(res.message ?? "Xato");
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
          O&apos;chirish
        </Button>
      }
      title={`"${label || name}" collection o'chirilsinmi?`}
      description="Bu amalni qaytarib bo'lmaydi. Collection va undagi barcha hujjatlar o'chiriladi."
      confirmLabel="O'chirish"
      variant="destructive"
      onConfirm={handle}
    />
  );
}
