"use client";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Button } from "@/shared/components/ui/button";
import { type TemplateSpecCredential, type TemplateSpecEnv, type TemplateSpecModule } from "@/shared/api/services";
import { Trash2 } from "lucide-react";

// Reusable grid-row editors for a template's spec (credentials / modules / envs).
// Shared between the create flow (none yet — spec is auto-built) and the
// unified template edit dialog's "Tarkib" tab.

export function CredentialRow({
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

export function ModuleRow({
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

export function EnvRow({
  item,
  onChange,
  onRemove,
}: {
  item: TemplateSpecEnv;
  onChange: (patch: Partial<TemplateSpecEnv>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-center">
      <Input
        value={item.key}
        onChange={(e) => onChange({ key: e.target.value })}
        placeholder="KEY (masalan: ADMIN_CHAT_ID)"
        className="font-mono text-xs h-8"
      />
      <Input
        value={item.label ?? ""}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="Nomi (foydalanuvchi ko'radi)"
        className="text-xs h-8"
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
