"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import { templateVersionAction } from "./actions";
import { type TemplateVersionDetail } from "@/shared/api/services";

export function VersionPreviewDialog({ templateId, version }: { templateId: string; version: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<TemplateVersionDetail | null>(null);

  async function handleOpenChange(v: boolean) {
    setOpen(v);
    if (v && !detail) {
      setLoading(true);
      const res = await templateVersionAction(templateId, version);
      setLoading(false);
      if (res.ok) {
        setDetail(res.data);
      } else {
        toast.error(res.message);
        setOpen(false);
      }
    }
  }

  const spec = detail?.spec ?? {};
  const credentials = spec.credentials ?? [];
  const modules = spec.modules ?? [];
  const envs = spec.envs ?? [];
  const collections = spec.collections ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
          <Eye className="h-3.5 w-3.5" />
          Ko&apos;rish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>v{version} tarkibi</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Yuklanmoqda...
          </div>
        ) : detail ? (
          <div className="space-y-5 text-sm">
            <p className="text-xs text-muted-foreground">
              Yaratilgan: {format(new Date(detail.created_at), "dd.MM.yyyy HH:mm")}
              {detail.note ? ` · ${detail.note}` : ""}
            </p>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Kredensialar ({credentials.length})
              </p>
              {credentials.length === 0 ? (
                <p className="text-xs text-muted-foreground">Yo&apos;q</p>
              ) : (
                <div className="divide-y rounded-md border">
                  {credentials.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <code className="font-mono font-medium">{c.key}</code>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                        {c.type}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {c.required ? "Majburiy" : "Ixtiyoriy"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Modullar ({modules.length})
              </p>
              {modules.length === 0 ? (
                <p className="text-xs text-muted-foreground">Yo&apos;q</p>
              ) : (
                <div className="divide-y rounded-md border">
                  {modules.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <code className="font-mono font-medium">{m.slug}</code>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {m.required ? "Majburiy" : "Ixtiyoriy"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Muhit o&apos;zgaruvchilari ({envs.length})
              </p>
              {envs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Yo&apos;q</p>
              ) : (
                <div className="divide-y rounded-md border">
                  {envs.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <code className="font-mono font-medium">{e.key}</code>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {e.required ? "Majburiy" : "Ixtiyoriy"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Kolleksiyalar ({collections.length})
              </p>
              {collections.length === 0 ? (
                <p className="text-xs text-muted-foreground">Yo&apos;q</p>
              ) : (
                <div className="divide-y rounded-md border">
                  {collections.map((col, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <code className="font-mono font-medium">{col.name}</code>
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                        {col.fields.length} maydon · {col.data.length} yozuv
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
