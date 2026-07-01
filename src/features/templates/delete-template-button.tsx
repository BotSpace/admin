"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTemplateAction } from "./actions";

export function DeleteTemplateButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Sotib olingan shablon: backend 400 + force talab qiladi — ikkinchi tasdiq.
  const [forceMessage, setForceMessage] = useState<string | null>(null);

  async function run(force: boolean) {
    setLoading(true);
    const res = await deleteTemplateAction(id, force);
    setLoading(false);
    if (res.ok) {
      toast.success("Shablon o'chirildi");
      setOpen(false);
      router.push("/templates");
      router.refresh();
      return;
    }
    if (!force && res.message.includes("force=true")) {
      setForceMessage(res.message);
      return;
    }
    toast.error(res.message);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setForceMessage(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1.5">
          <Trash2 className="h-3.5 w-3.5" />
          O&apos;chirish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shablonni o&apos;chirish</DialogTitle>
          <DialogDescription>
            {forceMessage ? (
              <>
                {forceMessage.replace(" O'chirish uchun ?force=true bilan qayta yuboring.", "")}{" "}
                Baribir BUTUNLAY o&apos;chirilsinmi? Versiya tarixi ham o&apos;chadi, buyurtmalar
                tarixi saqlanadi.
              </>
            ) : (
              <>
                &quot;{name}&quot; shabloni va uning barcha versiyalari BUTUNLAY o&apos;chiriladi.
                Bu amalni ortga qaytarib bo&apos;lmaydi.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button variant="destructive" onClick={() => run(!!forceMessage)} disabled={loading} className="gap-1.5">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {forceMessage ? "Baribir o'chirish" : "O'chirish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
