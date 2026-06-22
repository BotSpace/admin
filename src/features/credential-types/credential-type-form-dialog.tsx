"use client";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import {
  type CredentialType,
  type CredentialField,
  type CredentialFieldOption,
} from "@/shared/api/services";
import { createCredentialTypeAction, updateCredentialTypeAction } from "./actions";

const MODE_OPTIONS = [
  { value: "bearer", label: "Bearer Token" },
  { value: "apikey", label: "API Key" },
  { value: "basic", label: "Basic Auth" },
  { value: "header", label: "Header" },
  { value: "oauth2", label: "OAuth2" },
  { value: "none", label: "Boshqa" },
] as const;

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Matn" },
  { value: "password", label: "Parol" },
  { value: "number", label: "Son" },
  { value: "textarea", label: "Ko'p qatorli" },
  { value: "select", label: "Tanlash (select)" },
  { value: "url", label: "URL" },
  { value: "switch", label: "Kalit (switch)" },
] as const;

const KEY_REGEX = /^[a-z][a-z0-9_]{1,49}$/;

type FieldDraft = CredentialField & { _id: string };

function makeFieldId() {
  return Math.random().toString(36).slice(2);
}

function defaultField(): FieldDraft {
  return {
    _id: makeFieldId(),
    name: "",
    label: "",
    type: "text",
    secret: false,
    required: false,
  };
}

type Props = {
  credentialType?: CredentialType;
};

export function CredentialTypeFormDialog({ credentialType }: Props) {
  const isEdit = Boolean(credentialType);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Main fields
  const [key, setKey] = useState(credentialType?.key ?? "");
  const [label, setLabel] = useState(credentialType?.label ?? "");
  const [icon, setIcon] = useState(credentialType?.icon ?? "");
  const [color, setColor] = useState(credentialType?.color ?? "#6366f1");
  const [mode, setMode] = useState<CredentialType["mode"]>(credentialType?.mode ?? "apikey");

  // Fields builder
  const [fields, setFields] = useState<FieldDraft[]>(
    () =>
      credentialType?.fields.map((f) => ({ ...f, _id: makeFieldId() })) ?? []
  );

  // Expanded field index for options builder
  const [expandedField, setExpandedField] = useState<string | null>(null);

  function resetForm() {
    setKey(credentialType?.key ?? "");
    setLabel(credentialType?.label ?? "");
    setIcon(credentialType?.icon ?? "");
    setColor(credentialType?.color ?? "#6366f1");
    setMode(credentialType?.mode ?? "apikey");
    setFields(
      credentialType?.fields.map((f) => ({ ...f, _id: makeFieldId() })) ?? []
    );
    setExpandedField(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  function addField() {
    const f = defaultField();
    setFields((prev) => [...prev, f]);
    setExpandedField(f._id);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f._id !== id));
    if (expandedField === id) setExpandedField(null);
  }

  function updateField(id: string, patch: Partial<FieldDraft>) {
    setFields((prev) => prev.map((f) => (f._id === id ? { ...f, ...patch } : f)));
  }

  function moveField(id: string, dir: -1 | 1) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f._id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }

  function addOption(fieldId: string) {
    updateField(fieldId, {
      options: [
        ...(fields.find((f) => f._id === fieldId)?.options ?? []),
        { value: "", label: "" },
      ],
    });
  }

  function updateOption(fieldId: string, optIdx: number, patch: Partial<CredentialFieldOption>) {
    const f = fields.find((f) => f._id === fieldId);
    if (!f) return;
    const opts = [...(f.options ?? [])];
    opts[optIdx] = { ...opts[optIdx], ...patch };
    updateField(fieldId, { options: opts });
  }

  function removeOption(fieldId: string, optIdx: number) {
    const f = fields.find((f) => f._id === fieldId);
    if (!f) return;
    const opts = (f.options ?? []).filter((_, i) => i !== optIdx);
    updateField(fieldId, { options: opts });
  }

  const validate = useCallback((): string | null => {
    if (!label.trim()) return "Nom (label) kiritilishi shart";
    if (!isEdit) {
      if (!key.trim()) return "Key kiritilishi shart";
      if (!KEY_REGEX.test(key))
        return "Key: kichik harf/raqam/_ bo'lishi va a-z bilan boshlanishi kerak (2–50 belgi)";
    }
    for (const f of fields) {
      if (!f.name.trim()) return "Maydon 'name' bo'sh bo'lmasin";
      if (!f.label.trim()) return "Maydon 'label' bo'sh bo'lmasin";
      if (f.type === "select" && (!f.options || f.options.length === 0))
        return `"${f.label}" — select turida kamida 1 ta variant bo'lishi kerak`;
    }
    return null;
  }, [isEdit, key, label, fields]);

  async function handleSave() {
    const err = validate();
    if (err) { toast.error(err); return; }

    setLoading(true);
    // Strip internal _id before sending
    const cleanFields = fields.map(({ _id, ...rest }) => {
      void _id;
      return rest;
    });

    let res: { ok: boolean; message?: string };

    if (isEdit) {
      res = await updateCredentialTypeAction(credentialType!.key, {
        label,
        icon: icon || undefined,
        color: color || undefined,
        mode,
        fields: cleanFields,
      });
    } else {
      res = await createCredentialTypeAction({
        key,
        label,
        icon: icon || undefined,
        color: color || undefined,
        mode,
        fields: cleanFields,
      });
    }

    setLoading(false);
    if (res.ok) {
      toast.success(isEdit ? "Tur yangilandi" : "Yangi tur yaratildi");
      setOpen(false);
    } else {
      toast.error(res.message ?? "Xatolik");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4" /> Yangi tur
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `"${credentialType!.label}" turini tahrirlash` : "Yangi credential turi"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <div className="col-span-2 space-y-1">
                <Label>
                  Key <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="my_api_key"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Faqat kichik harf, raqam va _ (masalan: my_service_v2)
                </p>
              </div>
            )}

            <div className="col-span-2 space-y-1">
              <Label>
                Nomi (label) <span className="text-destructive">*</span>
              </Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My Service API"
              />
            </div>

            <div className="space-y-1">
              <Label>Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as CredentialType["mode"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Rang</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366f1"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Ikon (Lucide nomi, ixtiyoriy)</Label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Key, Globe, Lock, ..."
              />
            </div>
          </div>

          {/* Fields builder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Maydonlar</Label>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                <Plus className="h-3.5 w-3.5" /> Maydon qo&apos;shish
              </Button>
            </div>

            {fields.length === 0 && (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Hozircha maydon yo&apos;q. Yuqoridagi tugma bilan qo&apos;shing.
              </div>
            )}

            <div className="space-y-2">
              {fields.map((f, idx) => {
                const isExpanded = expandedField === f._id;
                return (
                  <div
                    key={f._id}
                    className="rounded-md border bg-card"
                  >
                    {/* Field header */}
                    <div className="flex items-center gap-2 px-3 py-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 min-w-0 text-sm font-mono text-muted-foreground truncate">
                        {f.name || <span className="italic">yangi maydon</span>}
                        {f.label && (
                          <span className="ml-2 not-italic text-foreground">{f.label}</span>
                        )}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {f.type}
                      </Badge>
                      {f.required && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          majburiy
                        </Badge>
                      )}
                      {f.secret && (
                        <Badge variant="warn" className="text-xs shrink-0">
                          maxfiy
                        </Badge>
                      )}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={idx === 0}
                          onClick={() => moveField(f._id, -1)}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={idx === fields.length - 1}
                          onClick={() => moveField(f._id, 1)}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setExpandedField(isExpanded ? null : f._id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeField(f._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Field body (expanded) */}
                    {isExpanded && (
                      <div className="border-t px-3 py-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Name (kod nomi)</Label>
                            <Input
                              value={f.name}
                              onChange={(e) =>
                                updateField(f._id, {
                                  name: e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9_]/g, ""),
                                })
                              }
                              placeholder="api_token"
                              className="font-mono text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label (ko&apos;rsatiladigan nom)</Label>
                            <Input
                              value={f.label}
                              onChange={(e) => updateField(f._id, { label: e.target.value })}
                              placeholder="API Token"
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tur</Label>
                            <Select
                              value={f.type}
                              onValueChange={(v) =>
                                updateField(f._id, {
                                  type: v as CredentialField["type"],
                                  options: v === "select" ? (f.options ?? []) : undefined,
                                })
                              }
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPE_OPTIONS.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Default qiymat (ixtiyoriy)</Label>
                            <Input
                              value={String(f.default ?? "")}
                              onChange={(e) => updateField(f._id, { default: e.target.value })}
                              placeholder="..."
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`req-${f._id}`}
                              checked={f.required ?? false}
                              onCheckedChange={(v) => updateField(f._id, { required: v })}
                            />
                            <Label htmlFor={`req-${f._id}`} className="text-xs cursor-pointer">
                              Majburiy
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id={`sec-${f._id}`}
                              checked={f.secret ?? false}
                              onCheckedChange={(v) => updateField(f._id, { secret: v })}
                            />
                            <Label htmlFor={`sec-${f._id}`} className="text-xs cursor-pointer">
                              Maxfiy (yashirin)
                            </Label>
                          </div>
                        </div>

                        {/* Options builder for select type */}
                        {f.type === "select" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold">Variantlar</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => addOption(f._id)}
                              >
                                <Plus className="h-3 w-3" /> Variant
                              </Button>
                            </div>
                            {(f.options ?? []).length === 0 && (
                              <p className="text-xs text-muted-foreground">
                                Hech qanday variant yo&apos;q
                              </p>
                            )}
                            <div className="space-y-1.5">
                              {(f.options ?? []).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <Input
                                    value={opt.value}
                                    onChange={(e) =>
                                      updateOption(f._id, optIdx, { value: e.target.value })
                                    }
                                    placeholder="value"
                                    className="font-mono text-xs h-8"
                                  />
                                  <Input
                                    value={opt.label}
                                    onChange={(e) =>
                                      updateOption(f._id, optIdx, { label: e.target.value })
                                    }
                                    placeholder="Ko'rsatiladigan nom"
                                    className="text-xs h-8"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                                    onClick={() => removeOption(f._id, optIdx)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

