"use client";
import { useRouter, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export function WithdrawalsFilter({ defaultStatus }: { defaultStatus?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      defaultValue={defaultStatus ?? ""}
      onValueChange={(v) => {
        const params = new URLSearchParams();
        if (v && v !== "all") params.set("status", v);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Holat" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Barcha</SelectItem>
        <SelectItem value="pending">Kutmoqda</SelectItem>
        <SelectItem value="approved">Tasdiqlangan</SelectItem>
        <SelectItem value="rejected">Rad etilgan</SelectItem>
      </SelectContent>
    </Select>
  );
}
