"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { type TemplateSpec, type TemplateSpecCredential, type TemplateSpecEnv, type TemplateSpecModule } from "@/shared/api/services";
import { updateSpecAction } from "./actions";
import { Settings2, Plus, Trash2 } from "lucide-react";

type Props = {
  templateId: number;
  spec: TemplateSpec;
};

function CredentialRow({
  item,
  onChange,
  onRemove,
}: {
  item: TemplateSpecCredential;
  onChange: (patch: Partial<TemplateSpecCredential>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
      <Input
        value={item.key}
        onChange={(e) => onChange({ key: e.target.value })}
        placeholder="key (masalan: main_openai)"
        className="font-mono text-xs h-8"
      />
      <Input
        value={item.type}
        onChange={(e) => onChange({ type: e.target.value })}
        placeholder="type (masalan: openai)"
        className="font-mono text-xs h-8"
      />
      <div className="flex items-center gap-1.5">
        <Switch
          checked={item.required}
          onCheckedChange={(v) => onChange({ required: v })}
          id={`cred-req-${item.key}`}
        />
        <Label htmlFor={`cred-req-${item.key}`} className="text-xs cursor-pointer">
          Majburiy
        </Label>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function ModuleRow({
  item,
  onChange,
  onRemove,
}: {
  item: TemplateSpecModule;
  onChange: (patch: Partial<TemplateSpecModule>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
      <Input
        value={item.slug}
        onChange={(e) => onChange({ slug: e.target.value })}
        placeholder="slug (masalan: payment-click)"
        className="font-mono text-xs h-8"
      />
      <div className="flex items-center gap-1.5">
        <Switch
          checked={item.required}
          onCheckedChange={(v) => onChange({ required: v })}
          id={`mod-req-${item.slug}`}
        />
        <Label htmlFor={`mod-req-${item.slug}`} className="text-xs cursor-pointer">
          Majburiy
        </Label>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function EnvRow({
  item,
  onChange,
  onRemove,
}: {
  item: TemplateSpecEnv;
  onChange: (patch: Partial<TemplateSpecEnv>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
      <Input
        value={item.key}
        onChange={(e) => onChange({ key: e.target.value })}
        placeholder="KEY (masalan: ADMIN_CHAT_ID)"
        className="font-mono text-xs h-8"
      />
      <Input
        value={item.description ?? ""}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Tavsif..."
        className="text-xs h-8"
      />
      <div className="flex items-center gap-1.5">
        <Switch
          checked={item.required}
          onCheckedChange={(v) => onChange({ required: v })}
          id={`env-req-${item.key}`}
        />
        <Label htmlFor={`env-req-${item.key}`} className="text-xs cursor-pointer">
          Majburiy
        </Label>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function SpecEditDialog({ templateId, spec }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<TemplateSpecCredential[]>(
    spec.credentials ?? []
  );
  const [modules, setModules] = useState<TemplateSpecModule[]>(
    spec.modules ?? []
  );
  const [envs, setEnvs] = useState<TemplateSpecEnv[]>(spec.envs ?? []);

  function resetFromSpec() {
    setCredentials(spec.credentials ?? []);
    setModules(spec.modules ?? []);
    setEnvs(spec.envs ?? []);
  }

  function handleOpen(v: boolean) {
    if (v) resetFromSpec();
    setOpen(v);
  }

  async function handle() {
    setLoading(true);
    const res = await updateSpecAction(templateId, {
      ...spec,
      credentials,
      modules,
      envs,
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Tarkib saqlandi");
      setOpen(false);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-1" />
          Tarkibni tahrirlash
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shablon tarkibini tahrirlash</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Credentials */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Kredensialar
                {credentials.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {credentials.length}
                  </Badge>
                )}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  setCredentials((prev) => [
                    ...prev,
                    { key: "", type: "", required: true, description: "" },
                  ])
                }
              >
                <Plus className="h-3 w-3" />
                Qo&apos;shish
              </Button>
            </div>
            {credentials.length === 0 ? (
              <p className="text-xs text-muted-foreground">Kredensialar yo&apos;q</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 text-xs text-muted-foreground px-0.5">
                  <span>Key</span>
                  <span>Type</span>
                  <span></span>
                  <span></span>
                </div>
                {credentials.map((c, i) => (
                  <CredentialRow
                    key={i}
                    item={c}
                    onChange={(patch) =>
                      setCredentials((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, ...patch } : x))
                      )
                    }
                    onRemove={() =>
                      setCredentials((prev) => prev.filter((_, j) => j !== i))
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Modullar
                {modules.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {modules.length}
                  </Badge>
                )}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  setModules((prev) => [...prev, { slug: "", required: true }])
                }
              >
                <Plus className="h-3 w-3" />
                Qo&apos;shish
              </Button>
            </div>
            {modules.length === 0 ? (
              <p className="text-xs text-muted-foreground">Modullar yo&apos;q</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs text-muted-foreground px-0.5">
                  <span>Slug</span>
                  <span></span>
                  <span></span>
                </div>
                {modules.map((m, i) => (
                  <ModuleRow
                    key={i}
                    item={m}
                    onChange={(patch) =>
                      setModules((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, ...patch } : x))
                      )
                    }
                    onRemove={() =>
                      setModules((prev) => prev.filter((_, j) => j !== i))
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Envs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Muhit o&apos;zgaruvchilari
                {envs.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {envs.length}
                  </Badge>
                )}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  setEnvs((prev) => [
                    ...prev,
                    { key: "", required: true, description: "" },
                  ])
                }
              >
                <Plus className="h-3 w-3" />
                Qo&apos;shish
              </Button>
            </div>
            {envs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Muhit o&apos;zgaruvchilari yo&apos;q
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 text-xs text-muted-foreground px-0.5">
                  <span>Key</span>
                  <span>Tavsif</span>
                  <span></span>
                  <span></span>
                </div>
                {envs.map((e, i) => (
                  <EnvRow
                    key={i}
                    item={e}
                    onChange={(patch) =>
                      setEnvs((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, ...patch } : x))
                      )
                    }
                    onRemove={() =>
                      setEnvs((prev) => prev.filter((_, j) => j !== i))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handle} disabled={loading}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
