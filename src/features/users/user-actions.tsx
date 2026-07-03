"use client";
import { useState } from "react";
import { toast } from "sonner";
import { AdminUserDetail } from "@/shared/api/services";
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
import { banUserAction, adjustBalanceAction } from "./actions";
import { ShieldOff, ShieldCheck, DollarSign } from "lucide-react";

export function UserActions({ user }: { user: AdminUserDetail }) {
  return (
    <div className="flex flex-wrap gap-3">
      <BanToggle user={user} />
      <BalanceDialog user={user} />
    </div>
  );
}

function BanToggle({ user }: { user: AdminUserDetail }) {
  async function handle() {
    const res = await banUserAction(user.id, !user.is_active);
    if (res.ok) {
      toast.success(user.is_active ? "Foydalanuvchi bloklandi" : "Foydalanuvchi faollashtirildi");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <ConfirmDialog
      trigger={
        <Button variant={user.is_active ? "destructive" : "default"} size="sm">
          {user.is_active ? (
            <><ShieldOff className="h-4 w-4" /> Bloklash</>
          ) : (
            <><ShieldCheck className="h-4 w-4" /> Faollashtirish</>
          )}
        </Button>
      }
      title={user.is_active ? "Foydalanuvchini bloklash" : "Foydalanuvchini faollashtirish"}
      description={
        user.is_active
          ? "Foydalanuvchi tizimga kira olmaydi. Davom etasizmi?"
          : "Foydalanuvchi yana kirish imkoniyatiga ega bo'ladi. Davom etasizmi?"
      }
      confirmLabel={user.is_active ? "Bloklash" : "Faollashtirish"}
      variant={user.is_active ? "destructive" : "default"}
      onConfirm={handle}
    />
  );
}

function BalanceDialog({ user }: { user: AdminUserDetail }) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle() {
    const n = Math.trunc(Number(delta));
    if (!delta.trim() || Number.isNaN(n) || n === 0) {
      toast.error("O'zgarish miqdorini kiriting (musbat yoki manfiy, butun son)");
      return;
    }
    setLoading(true);
    const res = await adjustBalanceAction(user.id, n, reason || undefined);
    setLoading(false);
    if (res.ok) {
      toast.success("Balans yangilandi");
      setOpen(false);
      setDelta("");
      setReason("");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="h-4 w-4" /> Balans tahrirlash
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Balans tahrirlash</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">
            Faqat asosiy balans (UZS) o&apos;zgartiriladi — shablon balansini tuzatish hali
            qo&apos;llab-quvvatlanmaydi. Hozirgi balans:{" "}
            <span className="font-mono font-medium text-foreground">
              {user.balance.toLocaleString("uz-UZ")}
            </span>
          </p>
          <div className="space-y-2">
            <Label>O&apos;zgarish (+/-)</Label>
            <Input
              type="number"
              step="1"
              placeholder="Musbat = qo'shish, manfiy = ayirish"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Sabab (ixtiyoriy)</Label>
            <Input
              placeholder="Sabab..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handle} disabled={loading}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
