"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef } from "react";
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
  defaultHasRelease?: string;
  defaultOrdering?: string;
};

export function MonitoringFilter({
  defaultSearch,
  defaultHasRelease,
  defaultOrdering,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  const [hasRelease, setHasRelease] = useState(defaultHasRelease ?? "");
  const [ordering, setOrdering] = useState(defaultOrdering ?? "");

  function buildParams(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const search =
      overrides.search !== undefined
        ? overrides.search
        : (searchRef.current?.value ?? defaultSearch ?? "");
    const hasReleaseVal =
      overrides.has_release !== undefined ? overrides.has_release : hasRelease;
    const orderingVal =
      overrides.ordering !== undefined ? overrides.ordering : ordering;

    if (search) params.set("search", search);
    if (hasReleaseVal) params.set("has_release", hasReleaseVal);
    if (orderingVal) params.set("ordering", orderingVal);
    return params;
  }

  function apply(overrides: Record<string, string | undefined> = {}) {
    const params = buildParams(overrides);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        apply({});
      }}
    >
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Qidiruv</Label>
        <Input
          ref={searchRef}
          defaultValue={defaultSearch}
          placeholder="Loyiha nomi yoki egasi..."
          className="w-64"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Reliz</Label>
        <Select
          value={hasRelease || "all"}
          onValueChange={(v) => {
            const val = v === "all" ? "" : v;
            setHasRelease(val);
            apply({ has_release: val });
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Hammasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hammasi</SelectItem>
            <SelectItem value="true">Bor</SelectItem>
            <SelectItem value="false">Yo&apos;q</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Saralash</Label>
        <Select
          value={ordering || "default"}
          onValueChange={(v) => {
            const val = v === "default" ? "" : v;
            setOrdering(val);
            apply({ ordering: val });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Standart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Standart</SelectItem>
            <SelectItem value="-cpu">CPU (ko&apos;p → kam)</SelectItem>
            <SelectItem value="cpu">CPU (kam → ko&apos;p)</SelectItem>
            <SelectItem value="-memory">RAM (ko&apos;p → kam)</SelectItem>
            <SelectItem value="memory">RAM (kam → ko&apos;p)</SelectItem>
            <SelectItem value="-disk">Disk (ko&apos;p → kam)</SelectItem>
            <SelectItem value="disk">Disk (kam → ko&apos;p)</SelectItem>
            <SelectItem value="-created_at">Yangi → eski</SelectItem>
            <SelectItem value="created_at">Eski → yangi</SelectItem>
            <SelectItem value="name">Nom (A-Z)</SelectItem>
            <SelectItem value="-name">Nom (Z-A)</SelectItem>
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
        onClick={() => {
          setHasRelease("");
          setOrdering("");
          router.push(pathname);
        }}
      >
        Tozalash
      </Button>
    </form>
  );
}
