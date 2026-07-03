"use client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { verifyTemplateAction } from "./actions";

export function VerifyToggle({ id, isVerify, name }: { id: string; isVerify: boolean; name: string }) {
  async function handle() {
    const res = await verifyTemplateAction(id, !isVerify);
    if (res.ok) {
      toast.success(isVerify ? "Tasdiqlash bekor qilindi" : "Shablon tasdiqlandi");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className={isVerify ? "text-destructive hover:text-destructive" : "text-emerald-600 hover:text-emerald-700"}
        >
          {isVerify ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          {isVerify ? "Bekor" : "Tasdiqlash"}
        </Button>
      }
      title={isVerify ? "Tasdiqlashni bekor qilish" : `"${name}" ni tasdiqlash`}
      description="Davom etasizmi?"
      confirmLabel={isVerify ? "Bekor qilish" : "Tasdiqlash"}
      variant={isVerify ? "destructive" : "default"}
      onConfirm={handle}
    />
  );
}
