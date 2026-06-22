"use client";
import { useRouter, usePathname } from "next/navigation";
import { useRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

type Props = {
  defaultSearch?: string;
  defaultActive?: string;
};

export function ModulesFilter({ defaultSearch, defaultActive }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  function apply(activeVal?: string) {
    const params = new URLSearchParams();
    const search = searchRef.current?.value ?? defaultSearch ?? "";
    const active = activeVal !== undefined ? activeVal : (defaultActive ?? "");
    if (search) params.set("search", search);
    if (active) params.set("active", active);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Qidiruv</Label>
        <Input
          ref={searchRef}
          defaultValue={defaultSearch}
          placeholder="Nom, slug, tavsif..."
          className="w-60"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Holat</Label>
        <Select
          defaultValue={defaultActive || "all"}
          onValueChange={(v) => {
            const val = v === "all" ? "" : v;
            apply(val);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Barchasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="true">Faol</SelectItem>
            <SelectItem value="false">Nofaol</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="sm">
        Qidirish
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => router.push(pathname)}
      >
        Tozalash
      </Button>
    </form>
  );
}
