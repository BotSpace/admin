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
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  defaultSearch?: string;
  defaultIsTemplate?: string;
  defaultHasRelease?: string;
  defaultCreatedAfter?: string;
  defaultCreatedBefore?: string;
  defaultOrdering?: string;
};

export function ProjectsFilter({
  defaultSearch,
  defaultIsTemplate,
  defaultHasRelease,
  defaultCreatedAfter,
  defaultCreatedBefore,
  defaultOrdering,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const createdAfterRef = useRef<HTMLInputElement>(null);
  const createdBeforeRef = useRef<HTMLInputElement>(null);

  const hasExtra = Boolean(
    defaultCreatedAfter || defaultCreatedBefore || defaultOrdering
  );
  const [extraOpen, setExtraOpen] = useState(hasExtra);
  const [isTemplate, setIsTemplate] = useState(defaultIsTemplate ?? "");
  const [hasRelease, setHasRelease] = useState(defaultHasRelease ?? "");
  const [ordering, setOrdering] = useState(defaultOrdering ?? "");

  function buildParams(overrides: Record<string, string | undefined>) {
    const get = (key: string, ref: React.RefObject<HTMLInputElement | null>, def?: string) =>
      overrides[key] !== undefined ? overrides[key] : (ref.current?.value ?? def ?? "");

    const params = new URLSearchParams();
    const search = get("search", searchRef, defaultSearch);
    const isTemplateVal = overrides.is_template !== undefined ? overrides.is_template : isTemplate;
    const hasReleaseVal = overrides.has_release !== undefined ? overrides.has_release : hasRelease;
    const createdAfterVal = get("created_after", createdAfterRef, defaultCreatedAfter);
    const createdBeforeVal = get("created_before", createdBeforeRef, defaultCreatedBefore);
    const orderingVal = overrides.ordering !== undefined ? overrides.ordering : ordering;

    if (search) params.set("search", search);
    if (isTemplateVal) params.set("is_template", isTemplateVal);
    if (hasReleaseVal) params.set("has_release", hasReleaseVal);
    if (createdAfterVal) params.set("created_after", createdAfterVal);
    if (createdBeforeVal) params.set("created_before", createdBeforeVal);
    if (orderingVal) params.set("ordering", orderingVal);
    return params;
  }

  function apply(overrides: Record<string, string | undefined> = {}) {
    const params = buildParams(overrides);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
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
            placeholder="Loyiha yoki egasi..."
            className="w-60"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Turi</Label>
          <Select
            value={isTemplate || "all"}
            onValueChange={(v) => {
              const val = v === "all" ? "" : v;
              setIsTemplate(val);
              apply({ is_template: val });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Hammasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              <SelectItem value="true">Shablon</SelectItem>
              <SelectItem value="false">Oddiy</SelectItem>
            </SelectContent>
          </Select>
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

        <Button type="submit" size="sm">
          Qidirish
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsTemplate("");
            setHasRelease("");
            setOrdering("");
            router.push(pathname);
          }}
        >
          Tozalash
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto gap-1"
          onClick={() => setExtraOpen((v) => !v)}
        >
          Ko&apos;proq filtrlar
          {extraOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>

      {extraOpen && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
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
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Standart" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Standart</SelectItem>
                  <SelectItem value="-created_at">Yangi → eski</SelectItem>
                  <SelectItem value="created_at">Eski → yangi</SelectItem>
                  <SelectItem value="name">Nom (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              apply({});
            }}
          >
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Yaratilgan (dan)</Label>
              <Input
                ref={createdAfterRef}
                type="date"
                defaultValue={defaultCreatedAfter}
                className="w-40"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Yaratilgan (gacha)</Label>
              <Input
                ref={createdBeforeRef}
                type="date"
                defaultValue={defaultCreatedBefore}
                className="w-40"
              />
            </div>

            <Button type="submit" size="sm" variant="secondary">
              Qo&apos;llash
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
