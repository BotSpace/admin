"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  type AdminTemplateDetail,
  type CredentialTypeInfo,
  type ModuleCatalogItem,
  type TemplateSpecCredential,
  type TemplateSpecEnv,
  type TemplateSpecModule,
} from "@/shared/api/services";
import { credentialTypesAction, modulesCatalogAction, updateTemplateAction } from "./actions";
import { CredentialRow, ModuleRow, EnvRow } from "./spec-editors";
import { Pencil, ImagePlus, X, Plus } from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

type FormState = {
  name: string;
  short_description: string;
  description: string;
  original_price: string;
  discount: string;
  discount_type: string;
  demo_url: string;
  is_verify: boolean;
};

function templateToForm(t: AdminTemplateDetail): FormState {
  return {
    name: t.name,
    short_description: t.short_description ?? "",
    description: t.description ?? "",
    original_price: t.original_price ?? "",
    discount: t.discount ?? "",
    discount_type: t.discount_type ?? "percent",
    demo_url: t.demo_url ?? "",
    is_verify: t.is_verify,
  };
}

export function TemplateEditDialog({ template }: { template: AdminTemplateDetail }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(templateToForm(template));
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const spec = template.spec ?? {};
  const [credentials, setCredentials] = useState<TemplateSpecCredential[]>(spec.credentials ?? []);
  const [modules, setModules] = useState<TemplateSpecModule[]>(spec.modules ?? []);
  const [envs, setEnvs] = useState<TemplateSpecEnv[]>(spec.envs ?? []);

  // Registrlar: credential type + modul katalogi — dialog ochilganda yuklanadi.
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeInfo[]>([]);
  const [moduleCatalog, setModuleCatalog] = useState<ModuleCatalogItem[]>([]);
  useEffect(() => {
    if (!open) return;
    void credentialTypesAction().then((r) => {
      if (r.ok) setCredentialTypes(r.data);
    });
    void modulesCatalogAction().then((r) => {
      if (r.ok) setModuleCatalog(r.data);
    });
  }, [open]);

  // Modul type'lari faqat tanlangan modullar uchun ko'rinadi.
  const selectedSlugs = new Set(modules.map((m) => m.slug).filter(Boolean));
  const availableTypes = credentialTypes.filter((t) => {
    if (!t.source?.startsWith("module:")) return true;
    return selectedSlugs.has(t.source.slice(7));
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetFromTemplate() {
    setForm(templateToForm(template));
    setCredentials(spec.credentials ?? []);
    setModules(spec.modules ?? []);
    setEnvs(spec.envs ?? []);
  }

  function handleOpenChange(v: boolean) {
    if (v) resetFromTemplate();
    setOpen(v);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qabul qilinadi");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.warning("Rasm hajmi 5 MB dan oshmasligi kerak");
    }
    setImageFile(file);
    const prev = imagePreview;
    if (prev) URL.revokeObjectURL(prev);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handle() {
    if (!form.name.trim()) {
      toast.error("Shablon nomini kiriting");
      return;
    }
    setLoading(true);
    const res = await updateTemplateAction(
      template.id,
      {
        name: form.name.trim(),
        short_description: form.short_description.trim() || undefined,
        description: form.description.trim() || undefined,
        original_price: form.original_price.trim() || undefined,
        discount: form.discount.trim() || undefined,
        discount_type: form.discount_type || undefined,
        demo_url: form.demo_url.trim() || undefined,
        is_verify: form.is_verify,
        spec: { ...spec, credentials, modules, envs },
      },
      imageFile ?? undefined
    );
    setLoading(false);
    if (res.ok) {
      toast.success("Shablon yangilandi");
      setOpen(false);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-1" />
          Tahrirlash
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shablonni tahrirlash</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Asosiy</TabsTrigger>
            <TabsTrigger value="content">Tarkib</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Image section */}
            <div className="space-y-1.5">
              <Label>Rasm</Label>
              {(imagePreview ?? template.image) ? (
                <div className="relative w-full h-40 rounded-md overflow-hidden border bg-muted">
                  <Image
                    src={imagePreview ?? template.image!}
                    alt="Shablon rasmi"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-1 hover:bg-background transition-colors"
                    title="Rasmni olib tashlash"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full h-32 rounded-md border border-dashed bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer gap-2 text-muted-foreground text-sm"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span>Rasm tanlash</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="tpl-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {!imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4 mr-1.5" />
                  {template.image ? "Rasmni almashtirish" : "Rasm yuklash"}
                </Button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-name">Nomi</Label>
              <Input
                id="tpl-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Shablon nomi"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-short-desc">Qisqa tavsif</Label>
              <Input
                id="tpl-short-desc"
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                placeholder="Qisqa tavsif..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-desc">Tavsif</Label>
              <Textarea
                id="tpl-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="To'liq tavsif..."
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-demo">Demo URL</Label>
              <Input
                id="tpl-demo"
                type="url"
                value={form.demo_url}
                onChange={(e) => set("demo_url", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-price">Narxi (UZS)</Label>
                <Input
                  id="tpl-price"
                  type="number"
                  value={form.original_price}
                  onChange={(e) => set("original_price", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-discount">Chegirma</Label>
                <Input
                  id="tpl-discount"
                  type="number"
                  value={form.discount}
                  onChange={(e) => set("discount", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Chegirma turi</Label>
              <Select value={form.discount_type} onValueChange={(v) => set("discount_type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Foiz (%)</SelectItem>
                  <SelectItem value="amount">Miqdor (so&apos;m)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="tpl-verify"
                checked={form.is_verify}
                onCheckedChange={(v) => set("is_verify", v)}
              />
              <Label htmlFor="tpl-verify">Tasdiqlangan</Label>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <p className="text-xs text-muted-foreground">
              Kolleksiyalar (flow ma&apos;lumotlari) faqat &quot;Loyihadan yangilash&quot; orqali
              yangilanadi va bu yerda tahrirlanmaydi.
            </p>

            {/* Modules — kredensiallardan OLDIN: modul credential type'larini ochadi */}
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
                  onClick={() => setModules((prev) => [...prev, { slug: "", required: true }])}
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
                    <span>Modul</span>
                    <span></span>
                    <span></span>
                  </div>
                  {modules.map((m, i) => (
                    <ModuleRow
                      key={i}
                      item={m}
                      slugOptions={moduleCatalog}
                      onChange={(patch) =>
                        setModules((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))
                      }
                      onRemove={() => setModules((prev) => prev.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
              )}
            </div>

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
                      typeOptions={availableTypes}
                      onChange={(patch) =>
                        setCredentials((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))
                      }
                      onRemove={() => setCredentials((prev) => prev.filter((_, j) => j !== i))}
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
                  onClick={() => setEnvs((prev) => [...prev, { key: "", required: true, description: "" }])}
                >
                  <Plus className="h-3 w-3" />
                  Qo&apos;shish
                </Button>
              </div>
              {envs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Muhit o&apos;zgaruvchilari yo&apos;q</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 text-xs text-muted-foreground px-0.5">
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
                        setEnvs((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))
                      }
                      onRemove={() => setEnvs((prev) => prev.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
