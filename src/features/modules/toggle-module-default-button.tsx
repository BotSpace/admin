"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { setModuleDefaultAction } from "./actions";

type Props = {
  slug: string;
  isDefault: boolean;
  /** "switch" — kichkina toggle (ro'yxat uchun), "labeled" — yonida "Default/Oddiy" matni bilan (detail uchun) */
  variant?: "switch" | "labeled";
};

export function ToggleModuleDefaultButton({ slug, isDefault, variant = "switch" }: Props) {
  const [optimistic, setOptimistic] = useState(isDefault);
  const [pending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    setOptimistic(checked);
    startTransition(async () => {
      const res = await setModuleDefaultAction(slug, checked);
      if (res.ok) {
        toast.success(
          checked
            ? "Modul \"Default\" deb belgilandi — yangi loyihalarda avtomatik o'rnatiladi"
            : "Modul \"Default\" belgisi olib tashlandi"
        );
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
          id={`module-default-${slug}`}
          checked={optimistic}
          onCheckedChange={handleChange}
          disabled={pending}
          aria-label={optimistic ? "Default belgisini olib tashlash" : "Default deb belgilash"}
          title="Yangi loyihalarda avtomatik o'rnatiladi"
        />
        <Label
          htmlFor={`module-default-${slug}`}
          className="text-sm cursor-pointer select-none"
          title="Yangi loyihalarda avtomatik o'rnatiladi"
        >
          {optimistic ? "Default" : "Oddiy"}
        </Label>
      </div>
    );
  }

  return (
    <Switch
      checked={optimistic}
      onCheckedChange={handleChange}
      disabled={pending}
      aria-label={optimistic ? "Default belgisini olib tashlash" : "Default deb belgilash"}
      title="Yangi loyihalarda avtomatik o'rnatiladi"
    />
  );
}

/** Faqat ko'rsatish uchun — interaktiv emas (SSR/server komponentlar uchun) */
export function ModuleDefaultBadge({ isDefault }: { isDefault: boolean }) {
  if (!isDefault) return null;
  return (
    <Badge
      variant="outline"
      className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-700 gap-1 select-none"
      title="Yangi loyihalarda avtomatik o'rnatiladi"
    >
      Default
    </Badge>
  );
}
