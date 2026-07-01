"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { searchProjectsAction } from "./actions";
import { type AdminProject } from "@/shared/api/services";

type Props = {
  value: AdminProject | null;
  onChange: (project: AdminProject | null) => void;
};

export function ProjectPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (!open) return;
    const myReq = ++reqId.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await searchProjectsAction(search);
      if (myReq !== reqId.current) return;
      if (res.ok) setResults(res.data);
      setLoading(false);
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [open, search]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-accent/40"
      >
        <span className={value ? "truncate" : "truncate text-muted-foreground"}>
          {value ? `${value.name}${value.username ? ` (@${value.username})` : ""}` : "Loyihani tanlang…"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-md">
          <div className="flex items-center gap-2 border-b px-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Loyiha nomi bo'yicha qidirish…"
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Yuklanmoqda…
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">Hech narsa topilmadi</div>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p);
                    setOpen(false);
                  }}
                  className={`block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-accent ${
                    value?.id === p.id ? "bg-accent/60 font-medium" : ""
                  }`}
                >
                  {p.name}
                  {p.username && <span className="text-muted-foreground"> · @{p.username}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
