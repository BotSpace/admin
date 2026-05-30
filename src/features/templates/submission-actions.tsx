"use client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { approveSubmissionAction, rejectSubmissionAction } from "./actions";

export function SubmissionActions({ id }: { id: number }) {
  async function handleApprove() {
    const res = await approveSubmissionAction(id);
    if (res.ok) toast.success("So'rov tasdiqlandi");
    else toast.error(res.message);
  }

  async function handleReject() {
    const res = await rejectSubmissionAction(id);
    if (res.ok) toast.success("So'rov rad etildi");
    else toast.error(res.message);
  }

  return (
    <div className="flex items-center gap-2">
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
            <CheckCircle className="h-4 w-4" /> Tasdiqlash
          </Button>
        }
        title="So'rovni tasdiqlash"
        description="Shablon ko'rinishga chiqariladi. Davom etasizmi?"
        confirmLabel="Tasdiqlash"
        variant="default"
        onConfirm={handleApprove}
      />
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <XCircle className="h-4 w-4" /> Rad etish
          </Button>
        }
        title="So'rovni rad etish"
        description="So'rov rad etiladi. Davom etasizmi?"
        confirmLabel="Rad etish"
        variant="destructive"
        onConfirm={handleReject}
      />
    </div>
  );
}
