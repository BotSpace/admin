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
  defaultStatus?: string;
  defaultPriceMin?: string;
  defaultPriceMax?: string;
  defaultCreatedAfter?: string;
  defaultCreatedBefore?: string;
  defaultOrdering?: string;
};

export function SubmissionsFilter({
  defaultSearch,
  defaultStatus,
  defaultPriceMin,
  defaultPriceMax,
  defaultCreatedAfter,
  defaultCreatedBefore,
  defaultOrdering,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const priceMinRef = useRef<HTMLInputElement>(null);
  const priceMaxRef = useRef<HTMLInputElement>(null);
  const createdAfterRef = useRef<HTMLInputElement>(null);
  const createdBeforeRef = useRef<HTMLInputElement>(null);

  const hasExtra = Boolean(
    defaultPriceMin || defaultPriceMax ||
    defaultCreatedAfter || defaultCreatedBefore || defaultOrdering
  );
  const [extraOpen, setExtraOpen] = useState(hasExtra);
  const [status, setStatus] = useState(defaultStatus ?? "");
  const [ordering, setOrdering] = useState(defaultOrdering ?? "");

  function buildParams(overrides: Record<string, string | undefined>) {
    const get = (key: string, ref: React.RefObject<HTMLInputElement | null>, def?: string) =>
      overrides[key] !== undefined ? overrides[key] : (ref.current?.value ?? def ?? "");

    const params = new URLSearchParams();
    const search = get("search", searchRef, defaultSearch);
    const statusVal = overrides.status !== undefined ? overrides.status : status;
    const priceMinVal = get("price_min", priceMinRef, defaultPriceMin);
    const priceMaxVal = get("price_max", priceMaxRef, defaultPriceMax);
    const createdAfterVal = get("created_after", createdAfterRef, defaultCreatedAfter);
    const createdBeforeVal = get("created_before", createdBeforeRef, defaultCreatedBefore);
    const orderingVal = overrides.ordering !== undefined ? overrides.ordering : ordering;

    if (search) params.set("search", search);
    if (statusVal) params.set("status", statusVal);
    if (priceMinVal) params.set("price_min", priceMinVal);
    if (priceMaxVal) params.set("price_max", priceMaxVal);
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
            placeholder="Shablon nomi yoki telefon..."
            className="w-64"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Holat</Label>
          <Select
            value={status || "all"}
            onValueChange={(v) => {
              const val = v === "all" ? "" : v;
              setStatus(val);
              apply({ status: val });
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Barcha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha</SelectItem>
              <SelectItem value="pending">Kutmoqda</SelectItem>
              <SelectItem value="approved">Tasdiqlangan</SelectItem>
              <SelectItem value="rejected">Rad etilgan</SelectItem>
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
            setStatus("");
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
                  <SelectItem value="original_price">Narx ↑</SelectItem>
                  <SelectItem value="-original_price">Narx ↓</SelectItem>
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
              <Label className="text-xs text-muted-foreground">Narx (dan, so&apos;m)</Label>
              <Input
                ref={priceMinRef}
                type="number"
                placeholder="0"
                defaultValue={defaultPriceMin}
                className="w-32"
                min={0}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Narx (gacha, so&apos;m)</Label>
              <Input
                ref={priceMaxRef}
                type="number"
                placeholder="∞"
                defaultValue={defaultPriceMax}
                className="w-32"
                min={0}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Yuborilgan (dan)</Label>
              <Input
                ref={createdAfterRef}
                type="date"
                defaultValue={defaultCreatedAfter}
                className="w-40"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Yuborilgan (gacha)</Label>
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
