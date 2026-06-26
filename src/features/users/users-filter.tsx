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

type PlanOption = { name: string; display: string };

type Props = {
  defaultSearch?: string;
  defaultRole?: string;
  defaultIsActive?: string;
  defaultIsStaff?: string;
  defaultPlan?: string;
  defaultJoinedAfter?: string;
  defaultJoinedBefore?: string;
  defaultBalanceMin?: string;
  defaultBalanceMax?: string;
  defaultOrdering?: string;
  plans?: PlanOption[];
};

export function UsersFilter({
  defaultSearch,
  defaultRole,
  defaultIsActive,
  defaultIsStaff,
  defaultPlan,
  defaultJoinedAfter,
  defaultJoinedBefore,
  defaultBalanceMin,
  defaultBalanceMax,
  defaultOrdering,
  plans = [],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const joinedAfterRef = useRef<HTMLInputElement>(null);
  const joinedBeforeRef = useRef<HTMLInputElement>(null);
  const balanceMinRef = useRef<HTMLInputElement>(null);
  const balanceMaxRef = useRef<HTMLInputElement>(null);

  // Extra filters open by default if any extra param is active
  const hasExtra = Boolean(
    defaultIsStaff || defaultPlan || defaultJoinedAfter ||
    defaultJoinedBefore || defaultBalanceMin || defaultBalanceMax || defaultOrdering
  );
  const [extraOpen, setExtraOpen] = useState(hasExtra);

  // Controlled selects
  const [role, setRole] = useState(defaultRole ?? "");
  const [isActive, setIsActive] = useState(defaultIsActive ?? "");
  const [isStaff, setIsStaff] = useState(defaultIsStaff ?? "");
  const [plan, setPlan] = useState(defaultPlan ?? "");
  const [ordering, setOrdering] = useState(defaultOrdering ?? "");

  function buildParams(overrides: Record<string, string | undefined>) {
    const get = (key: string, ref: React.RefObject<HTMLInputElement | null>, def?: string) =>
      overrides[key] !== undefined ? overrides[key] : (ref.current?.value ?? def ?? "");

    const params = new URLSearchParams();
    const search = get("search", searchRef, defaultSearch);
    const roleVal = overrides.role !== undefined ? overrides.role : role;
    const isActiveVal = overrides.is_active !== undefined ? overrides.is_active : isActive;
    const isStaffVal = overrides.is_staff !== undefined ? overrides.is_staff : isStaff;
    const planVal = overrides.plan !== undefined ? overrides.plan : plan;
    const joinedAfterVal = get("joined_after", joinedAfterRef, defaultJoinedAfter);
    const joinedBeforeVal = get("joined_before", joinedBeforeRef, defaultJoinedBefore);
    const balanceMinVal = get("balance_min", balanceMinRef, defaultBalanceMin);
    const balanceMaxVal = get("balance_max", balanceMaxRef, defaultBalanceMax);
    const orderingVal = overrides.ordering !== undefined ? overrides.ordering : ordering;

    if (search) params.set("search", search);
    if (roleVal) params.set("role", roleVal);
    if (isActiveVal) params.set("is_active", isActiveVal);
    if (isStaffVal) params.set("is_staff", isStaffVal);
    if (planVal) params.set("plan", planVal);
    if (joinedAfterVal) params.set("joined_after", joinedAfterVal);
    if (joinedBeforeVal) params.set("joined_before", joinedBeforeVal);
    if (balanceMinVal) params.set("balance_min", balanceMinVal);
    if (balanceMaxVal) params.set("balance_max", balanceMaxVal);
    if (orderingVal) params.set("ordering", orderingVal);
    return params;
  }

  function apply(overrides: Record<string, string | undefined> = {}) {
    const params = buildParams(overrides);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      {/* Main filter row */}
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
            placeholder="Telefon, email yoki ism..."
            className="w-60"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Rol</Label>
          <Select
            value={role || "all"}
            onValueChange={(v) => {
              const val = v === "all" ? "" : v;
              setRole(val);
              apply({ role: val });
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Barcha rollar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha rollar</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Holat</Label>
          <Select
            value={isActive || "all"}
            onValueChange={(v) => {
              const val = v === "all" ? "" : v;
              setIsActive(val);
              apply({ is_active: val });
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Barcha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha</SelectItem>
              <SelectItem value="true">Faol</SelectItem>
              <SelectItem value="false">Bloklangan</SelectItem>
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
            setRole("");
            setIsActive("");
            setIsStaff("");
            setPlan("");
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

      {/* Extra filters */}
      {extraOpen && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            {/* Staff */}
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Staff</Label>
              <Select
                value={isStaff || "all"}
                onValueChange={(v) => {
                  const val = v === "all" ? "" : v;
                  setIsStaff(val);
                  apply({ is_staff: val });
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Hammasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hammasi</SelectItem>
                  <SelectItem value="true">Ha</SelectItem>
                  <SelectItem value="false">Yo&apos;q</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plan */}
            {plans.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Tarif rejasi</Label>
                <Select
                  value={plan || "all"}
                  onValueChange={(v) => {
                    const val = v === "all" ? "" : v;
                    setPlan(val);
                    apply({ plan: val });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Barcha tariflar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha tariflar</SelectItem>
                    {plans.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Ordering */}
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
                  <SelectItem value="-date_joined">Yangi → eski</SelectItem>
                  <SelectItem value="date_joined">Eski → yangi</SelectItem>
                  <SelectItem value="balance">Balans ↑</SelectItem>
                  <SelectItem value="-balance">Balans ↓</SelectItem>
                  <SelectItem value="-tokens_used_total">Tokens ko&apos;p</SelectItem>
                  <SelectItem value="tokens_used_total">Tokens kam</SelectItem>
                  <SelectItem value="-id">ID ↓</SelectItem>
                  <SelectItem value="id">ID ↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date + balance row */}
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              apply({});
            }}
          >
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Qo&apos;shilgan (dan)</Label>
              <Input
                ref={joinedAfterRef}
                type="date"
                defaultValue={defaultJoinedAfter}
                className="w-40"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Qo&apos;shilgan (gacha)</Label>
              <Input
                ref={joinedBeforeRef}
                type="date"
                defaultValue={defaultJoinedBefore}
                className="w-40"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Balans (dan, so&apos;m)</Label>
              <Input
                ref={balanceMinRef}
                type="number"
                placeholder="0"
                defaultValue={defaultBalanceMin}
                className="w-32"
                min={0}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Balans (gacha, so&apos;m)</Label>
              <Input
                ref={balanceMaxRef}
                type="number"
                placeholder="∞"
                defaultValue={defaultBalanceMax}
                className="w-32"
                min={0}
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
