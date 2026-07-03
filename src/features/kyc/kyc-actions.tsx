"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { approveKycAction, rejectKycAction } from "./actions";

export function KycActions({ id }: { id: string }) {
  const router = useRouter();
  async function handleApprove() {
    const res = await approveKycAction(id);
    if (res.ok) {
      toast.success("Verifikatsiya tasdiqlandi");
      router.push("/kyc");
    } else toast.error(res.message);
  }

  return (
    <div className="flex items-center gap-2">
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
            <CheckCircle className="h-4 w-4" /> Tasdiqlash
          </Button>
        }
        title="Verifikatsiyani tasdiqlash"
        description="Foydalanuvchi pul yecha oladigan bo'ladi. Davom etasizmi?"
        confirmLabel="Tasdiqlash"
        variant="default"
        onConfirm={handleApprove}
      />
      <RejectDialog id={id} />
    </div>
  );
}

function RejectDialog({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!reason.trim()) {
      toast.error("Rad etish sababini kiriting");
      return;
    }
    setLoading(true);
    const res = await rejectKycAction(id, reason);
    setLoading(false);
    if (res.ok) {
      toast.success("Verifikatsiya rad etildi");
      setOpen(false);
      setReason("");
      router.push("/kyc");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <XCircle className="h-4 w-4" /> Rad etish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rad etish sababi</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Sabab</Label>
          <Input
            placeholder="Rad etish sababini kiriting..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button variant="destructive" onClick={handle} disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Rad etish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
