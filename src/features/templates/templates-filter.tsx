"use client";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useRef } from "react";

type Props = { defaultSearch?: string; defaultIsVerify?: string };

export function TemplatesFilter({ defaultSearch, defaultIsVerify }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLInputElement>(null);

  function apply(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const search = overrides.search !== undefined ? overrides.search : (ref.current?.value ?? defaultSearch ?? "");
    const is_verify = overrides.is_verify !== undefined ? overrides.is_verify : (defaultIsVerify ?? "");
    if (search) params.set("search", search);
    if (is_verify) params.set("is_verify", is_verify);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); apply({}); }}>
      <Input ref={ref} defaultValue={defaultSearch} placeholder="Shablon nomi..." className="w-64" />
      <Select defaultValue={defaultIsVerify ?? ""} onValueChange={(v) => apply({ is_verify: v === "all" ? "" : v })}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Holat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Barcha</SelectItem>
          <SelectItem value="true">Tasdiqlangan</SelectItem>
          <SelectItem value="false">Kutmoqda</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" size="sm">Qidirish</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => router.push(pathname)}>Tozalash</Button>
    </form>
  );
}
