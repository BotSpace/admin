"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/button";

const RANGES = [
  { label: "1s", value: "1h" },
  { label: "6s", value: "6h" },
  { label: "24s", value: "24h" },
  { label: "7 kun", value: "7d" },
] as const;

type Props = {
  current: string;
};

export function RangeSelector({ current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(range: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-md border bg-card p-1">
      {RANGES.map((r) => (
        <Button
          key={r.value}
          size="sm"
          variant={current === r.value ? "default" : "ghost"}
          className="h-7 px-3 text-xs"
          onClick={() => select(r.value)}
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}
