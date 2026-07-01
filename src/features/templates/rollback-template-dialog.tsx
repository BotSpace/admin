"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Undo2 } from "lucide-react";
import { rollbackTemplateAction } from "./actions";

export function RollbackTemplateDialog({ templateId, version }: { templateId: number; version: number }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    const res = await rollbackTemplateAction(templateId, {
      version,
      note: note.trim() || undefined,
    });
    setLoading(false);
    if (res.ok) {
      toast.success(`v${version} ga qaytarildi`);
      setOpen(false);
      setNote("");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <Undo2 className="h-3.5 w-3.5" />
          Qaytarish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>v{version} versiyasiga qaytarish</DialogTitle>
          <DialogDescription>
            Shablon tarkibi ushbu versiyadagi holatga qaytariladi. Bu yangi versiya sifatida
            saqlanadi (tarix yo&apos;qolmaydi). Davom etasizmi?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="rollback-note">Izoh (ixtiyoriy)</Label>
          <Textarea
            id="rollback-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nima uchun qaytarilyapti..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handle} disabled={loading}>
            {loading ? "Qaytarilmoqda..." : "Qaytarish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
