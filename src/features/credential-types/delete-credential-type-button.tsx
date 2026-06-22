"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { deleteCredentialTypeAction } from "./actions";

type Props = {
  credentialKey: string;
  label: string;
};

export function DeleteCredentialTypeButton({ credentialKey, label }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const openedAtRef = useRef(0);

  function openDialog(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    openedAtRef.current = Date.now();
    setOpen(true);
  }

  function handleOpenChange(next: boolean) {
    if (!next && Date.now() - openedAtRef.current < 300) return;
    setOpen(next);
  }

  async function handle() {
    setLoading(true);
    try {
      const res = await deleteCredentialTypeAction(credentialKey);
      if (res.ok) {
        toast.success("Tur o'chirildi");
        setOpen(false);
      } else {
        toast.error(res.message ?? "Xatolik");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={openDialog}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{`"${label}" turini o'chirish`}</DialogTitle>
            <DialogDescription>
              Bu turni o&apos;chirsangiz, unga bog&apos;liq barcha credential
              maydonlari ishlashdan to&apos;xtashi mumkin. Davom etasizmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handle} disabled={loading}>
              {loading ? "Yuklanmoqda..." : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
