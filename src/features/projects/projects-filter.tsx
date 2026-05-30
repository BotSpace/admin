"use client";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useRef } from "react";

export function ProjectsFilter({ defaultSearch }: { defaultSearch?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      className="flex items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (ref.current?.value) params.set("search", ref.current.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <Input ref={ref} defaultValue={defaultSearch} placeholder="Loyiha nomi..." className="w-64" />
      <Button type="submit" size="sm">Qidirish</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => router.push(pathname)}>
        Tozalash
      </Button>
    </form>
  );
}
