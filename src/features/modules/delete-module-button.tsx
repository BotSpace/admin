"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { deleteModuleAction } from "./actions";

type Props = {
  slug: string;
  name: string;
  /** detail sahifasida o'chirishdan keyin /modules ga redirect */
  redirectAfter?: boolean;
};

export function DeleteModuleButton({ slug, name, redirectAfter }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  // Timestamp of the opening click — used to swallow the spurious onOpenChange
  // (false) that Radix fires in the same tick as the opening click (the dialog
  // would otherwise flash open and immediately close).
  const openedAtRef = useRef(0);

  function openDialog(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    openedAtRef.current = Date.now();
    setOpen(true);
  }

  function handleOpenChange(next: boolean) {
    if (!next && Date.now() - openedAtRef.current < 300) return; // ignore instant close
    setOpen(next);
  }

  async function handle() {
    setLoading(true);
    try {
      const res = await deleteModuleAction(slug);
      if (res.ok) {
        toast.success("Modul o'chirildi");
        setOpen(false);
        if (redirectAfter) startTransition(() => router.push("/modules"));
      } else {
        toast.error(res.message);
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
          // Don't let the opening click (or any outside pointer) dismiss it —
          // this is what caused the dialog to flash open then instantly close.
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{`"${name}" modulini o'chirish`}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Bu modul o&apos;chirilsa barcha unga bog&apos;liq sozlamalar ham
                  o&apos;chiriladi.
                </p>
                <p className="text-destructive font-medium">
                  Diqqat: modul Kubernetes&apos;dan ham o&apos;chib ketadi (pod, servis va
                  barcha resurslar). Bu amalni qaytarib bo&apos;lmaydi.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
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
