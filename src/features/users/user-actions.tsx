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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
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
  const [field, setField] = useState<"balance" | "template_balance">("balance");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!value.trim()) {
      toast.error("Miqdorni kiriting");
      return;
    }
    setLoading(true);
    const res = await adjustBalanceAction(user.id, field, value, note || undefined);
    setLoading(false);
    if (res.ok) {
      toast.success("Balans yangilandi");
      setOpen(false);
      setValue("");
      setNote("");
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
          <div className="space-y-2">
            <Label>Maydon</Label>
            <Select value={field} onValueChange={(v) => setField(v as "balance" | "template_balance")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance">Balans (UZS)</SelectItem>
                <SelectItem value="template_balance">Shablon balansi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Yangi qiymat</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Izoh (ixtiyoriy)</Label>
            <Input
              placeholder="Sabab..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
