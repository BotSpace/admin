"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

const TABS = [
  { value: "all", label: "Barchasi" },
  { value: "code", label: "Kod (built-in)" },
  { value: "admin", label: "Admin" },
  { value: "module", label: "Modullar" },
] as const;

type Props = {
  defaultSource?: string;
};

export function CredentialTypesSourceTabs({ defaultSource }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("source");
    } else {
      params.set("source", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const current = defaultSource ?? "all";

  return (
    <Tabs value={current} onValueChange={handleChange}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
