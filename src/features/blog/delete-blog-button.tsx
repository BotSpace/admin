"use client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteBlogPostAction } from "./actions";

export function DeleteBlogButton({ id, title }: { id: number; title: string }) {
  async function handle() {
    const res = await deleteBlogPostAction(id);
    if (res.ok) {
      toast.success("Post o'chirildi");
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
      title={`"${title}" ni o'chirish`}
      description="Bu amalni qaytarib bo'lmaydi. Davom etasizmi?"
      confirmLabel="O'chirish"
      variant="destructive"
      onConfirm={handle}
    />
  );
}
