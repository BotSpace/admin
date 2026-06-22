"use client";
import { useState, useTransition } from "react";
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
      {/* Self-controlled dialog: stopPropagation so a clickable row / parent
          doesn't swallow the click and instantly re-close the dialog. */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{`"${name}" modulini o'chirish`}</DialogTitle>
            <DialogDescription>
              Bu modul o&apos;chirilsa barcha unga bog&apos;liq sozlamalar ham
              o&apos;chiriladi. Davom etasizmi?
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
