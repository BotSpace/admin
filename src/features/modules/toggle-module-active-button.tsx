"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { setModuleActiveAction } from "./actions";

type Props = {
  slug: string;
  active: boolean;
  /** "switch" — kichkina toggle (ro'yxat uchun), "labeled" — yonida "Yoqilgan/O'chirilgan" matni bilan (detail uchun) */
  variant?: "switch" | "labeled";
};

export function ToggleModuleActiveButton({ slug, active, variant = "switch" }: Props) {
  const [optimistic, setOptimistic] = useState(active);
  const [pending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    setOptimistic(checked);
    startTransition(async () => {
      const res = await setModuleActiveAction(slug, checked);
      if (res.ok) {
        toast.success(checked ? "Modul yoqildi" : "Modul o'chirildi");
      } else {
        setOptimistic(!checked); // rollback
        toast.error(res.message ?? "Xatolik yuz berdi");
      }
    });
  }

  if (variant === "labeled") {
    return (
      <div className="flex items-center gap-2">
        <Switch
          id={`module-active-${slug}`}
          checked={optimistic}
          onCheckedChange={handleChange}
          disabled={pending}
          aria-label={optimistic ? "Modulni o'chirish" : "Modulni yoqish"}
        />
        <Label
          htmlFor={`module-active-${slug}`}
          className="text-sm cursor-pointer select-none"
        >
          {optimistic ? "Yoqilgan" : "O'chirilgan"}
        </Label>
      </div>
    );
  }

  return (
    <Switch
      checked={optimistic}
      onCheckedChange={handleChange}
      disabled={pending}
      aria-label={optimistic ? "Modulni o'chirish" : "Modulni yoqish"}
      title={optimistic ? "O'chirish" : "Yoqish"}
    />
  );
}
