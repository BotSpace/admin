"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { refreshModuleManifestAction } from "./actions";

export function RefreshManifestButton({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);

  function handle() {
    setSpinning(true);
    startTransition(async () => {
      const res = await refreshModuleManifestAction(slug);
      if (res.ok) toast.success("Manifest yangilandi");
      else toast.error(res.message);
      setSpinning(false);
    });
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" disabled={pending} onClick={handle}>
      <RefreshCw className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`} />
      Yangilash
    </Button>
  );
}
