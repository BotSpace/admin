"use client";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { useRef } from "react";

type Props = {
  defaultSearch?: string;
  defaultRole?: string;
  defaultIsActive?: string;
};

export function UsersFilter({ defaultSearch, defaultRole, defaultIsActive }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  function apply(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const search = overrides.search !== undefined ? overrides.search : (searchRef.current?.value ?? defaultSearch ?? "");
    const role = overrides.role !== undefined ? overrides.role : (defaultRole ?? "");
    const is_active = overrides.is_active !== undefined ? overrides.is_active : (defaultIsActive ?? "");
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (is_active) params.set("is_active", is_active);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      className="flex flex-wrap items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        apply({});
      }}
    >
      <Input
        ref={searchRef}
        defaultValue={defaultSearch}
        placeholder="Telefon, email yoki ism..."
        className="w-64"
      />
      <Select
        defaultValue={defaultRole ?? ""}
        onValueChange={(v) => apply({ role: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Barcha rollar</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={defaultIsActive ?? ""}
        onValueChange={(v) => apply({ is_active: v === "all" ? "" : v })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Holat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Barcha</SelectItem>
          <SelectItem value="true">Faol</SelectItem>
          <SelectItem value="false">Bloklangan</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" size="sm">Qidirish</Button>
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
