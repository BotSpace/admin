"use client";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type CredentialTypeInfo,
  type ModuleCatalogItem,
  type TemplateSpecCredential,
  type TemplateSpecEnv,
  type TemplateSpecModule,
} from "@/shared/api/services";
import { Trash2 } from "lucide-react";

// Reusable grid-row editors for a template's spec (credentials / modules / envs).
// Shared between the create wizard and the unified template edit dialog's
// "Tarkib" tab. When option lists are provided, type/slug render as Select;
// otherwise they fall back to a plain text input.

export function CredentialRow({
  item,
  onChange,
  onRemove,
  typeOptions,
}: {
  item: TemplateSpecCredential;
  onChange: (patch: Partial<TemplateSpecCredential>) => void;
  onRemove: () => void;
  typeOptions?: CredentialTypeInfo[];
}) {
  // Joriy qiymat ro'yxatda bo'lmasa ham ko'rinsin (legacy/noma'lum type).
  const options =
    typeOptions && item.type && !typeOptions.some((t) => t.key === item.type)
      ? [...typeOptions, { key: item.type, label: item.type }]
      : typeOptions;

  return (
    <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
      <Input
        value={item.key}
        onChange={(e) => onChange({ key: e.target.value })}
        placeholder="key (masalan: main_openai)"
        className="font-mono text-xs h-8"
      />
      {options && options.length > 0 ? (
        <Select value={item.type || ""} onValueChange={(v) => onChange({ type: v })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Type tanlang" />
          </SelectTrigger>
          <SelectContent>
            {options.map((t) => (
              <SelectItem key={t.key} value={t.key} className="text-xs">
                {t.label || t.key}
                {t.source?.startsWith("module:") && (
                  <span className="ml-1.5 text-muted-foreground">({t.source.slice(7)})</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={item.type}
          onChange={(e) => onChange({ type: e.target.value })}
          placeholder="type (masalan: openai)"
          className="font-mono text-xs h-8"
        />
      )}
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
  // Qabul qilinadi lekin ishlatilmaydi — modul slug ODDIY input (user talabi:
  // async katalog kelganda Input→Select almashuvi yozishni buzardi).
  slugOptions?: ModuleCatalogItem[];
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
