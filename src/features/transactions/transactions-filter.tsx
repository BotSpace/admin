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
  defaultAmountMin?: string;
  defaultAmountMax?: string;
  defaultCreatedAfter?: string;
  defaultCreatedBefore?: string;
  defaultOrdering?: string;
};

export function TransactionsFilter({
  defaultSearch,
  defaultStatus,
  defaultAmountMin,
  defaultAmountMax,
  defaultCreatedAfter,
  defaultCreatedBefore,
  defaultOrdering,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const amountMinRef = useRef<HTMLInputElement>(null);
  const amountMaxRef = useRef<HTMLInputElement>(null);
  const createdAfterRef = useRef<HTMLInputElement>(null);
  const createdBeforeRef = useRef<HTMLInputElement>(null);

  const hasExtra = Boolean(
    defaultAmountMin || defaultAmountMax ||
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
    const amountMinVal = get("amount_min", amountMinRef, defaultAmountMin);
    const amountMaxVal = get("amount_max", amountMaxRef, defaultAmountMax);
    const createdAfterVal = get("created_after", createdAfterRef, defaultCreatedAfter);
    const createdBeforeVal = get("created_before", createdBeforeRef, defaultCreatedBefore);
    const orderingVal = overrides.ordering !== undefined ? overrides.ordering : ordering;

    if (search) params.set("search", search);
    if (statusVal) params.set("status", statusVal);
    if (amountMinVal) params.set("amount_min", amountMinVal);
    if (amountMaxVal) params.set("amount_max", amountMaxVal);
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
            placeholder="Telefon yoki kalit..."
            className="w-60"
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
              <SelectValue placeholder="Hammasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hammasi</SelectItem>
              <SelectItem value="true">To&apos;langan</SelectItem>
              <SelectItem value="false">To&apos;lanmagan</SelectItem>
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
                  <SelectItem value="-amount">Summa ↓</SelectItem>
                  <SelectItem value="amount">Summa ↑</SelectItem>
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
              <Label className="text-xs text-muted-foreground">Summa (dan, so&apos;m)</Label>
              <Input
                ref={amountMinRef}
                type="number"
                placeholder="0"
                defaultValue={defaultAmountMin}
                className="w-32"
                min={0}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Summa (gacha, so&apos;m)</Label>
              <Input
                ref={amountMaxRef}
                type="number"
                placeholder="∞"
                defaultValue={defaultAmountMax}
                className="w-32"
                min={0}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Sana (dan)</Label>
              <Input
                ref={createdAfterRef}
                type="date"
                defaultValue={defaultCreatedAfter}
                className="w-40"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Sana (gacha)</Label>
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
