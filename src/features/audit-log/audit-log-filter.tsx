"use client";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useRef } from "react";

type Props = { defaultAction?: string; defaultTargetType?: string };

export function AuditLogFilter({ defaultAction, defaultTargetType }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const actionRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="flex flex-wrap items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (actionRef.current?.value) params.set("action", actionRef.current.value);
        if (typeRef.current?.value) params.set("target_type", typeRef.current.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <Input ref={actionRef} defaultValue={defaultAction} placeholder="Amal turi..." className="w-48" />
      <Input ref={typeRef} defaultValue={defaultTargetType} placeholder="Ob'ekt turi..." className="w-48" />
      <Button type="submit" size="sm">Qidirish</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => router.push(pathname)}>Tozalash</Button>
    </form>
  );
}
