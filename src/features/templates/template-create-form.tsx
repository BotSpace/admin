"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ImagePlus, X, Info, Loader2, Plus } from "lucide-react";
import {
  type AdminProject,
  type TemplateCategory,
  type TemplateSpecCredential,
  type TemplateSpecEnv,
  type TemplateSpecModule,
} from "@/shared/api/services";
import { createTemplateAction, previewTemplateSpecAction } from "./actions";
import { ProjectPicker } from "./project-picker";
import { CredentialRow, ModuleRow, EnvRow } from "./spec-editors";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

type FormState = {
  name: string;
  short_description: string;
  description: string;
  original_price: string;
  discount: string;
  discount_type: "percent" | "amount";
  demo_url: string;
  is_verify: boolean;
};

const initialForm: FormState = {
  name: "",
  short_description: "",
  description: "",
  original_price: "",
  discount: "",
  discount_type: "percent",
  demo_url: "",
  is_verify: false,
};

export function TemplateCreateForm({ categories }: { categories: TemplateCategory[] }) {
  const router = useRouter();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Spec editors ("Tarkib" tab) — pre-filled from the selected project via
  // preview-spec, then freely editable before submit.
  const [credentials, setCredentials] = useState<TemplateSpecCredential[]>([]);
  const [modules, setModules] = useState<TemplateSpecModule[]>([]);
  const [envs, setEnvs] = useState<TemplateSpecEnv[]>([]);
  const [specLoading, setSpecLoading] = useState(false);
  const specReqId = useRef(0);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleProjectChange(p: AdminProject | null) {
    setProject(p);
    if (!p) {
      setCredentials([]);
      setModules([]);
      setEnvs([]);
      return;
    }
    const myReq = ++specReqId.current;
    setSpecLoading(true);
    const res = await previewTemplateSpecAction(p.id);
    if (myReq !== specReqId.current) return;
    setSpecLoading(false);
    if (res.ok) {
      setCredentials(res.data.credentials ?? []);
      setModules(res.data.modules ?? []);
      setEnvs(res.data.envs ?? []);
    } else {
      toast.error(res.message);
    }
  }

  function toggleCategory(id: number) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
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

  async function handleSubmit() {
    if (!project) {
      toast.error("Loyihani tanlang");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Shablon nomini kiriting");
      return;
    }
    if (!form.original_price.trim()) {
      toast.error("Narxni kiriting");
      return;
    }
    setLoading(true);
    const res = await createTemplateAction(
      {
        project: project.id,
        name: form.name.trim(),
        short_description: form.short_description.trim() || undefined,
        description: form.description.trim() || undefined,
        original_price: form.original_price.trim(),
        discount: form.discount.trim() || undefined,
        discount_type: form.discount_type,
        demo_url: form.demo_url.trim() || undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        is_verify: form.is_verify,
        spec_overrides: { credentials, modules, envs },
      },
      imageFile ?? undefined
    );
    setLoading(false);
    if (res.ok) {
      toast.success("Shablon yaratildi");
      router.push(`/templates/${res.id}`);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Loyiha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ProjectPicker value={project} onChange={handleProjectChange} />
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Shablon tarkibi (kredensiallar, modullar, muhit o&apos;zgaruvchilari, kolleksiyalar)
            tanlangan loyihadan avtomatik yig&apos;iladi. &quot;Tarkib&quot; bo&apos;limida
            kredensial/modul/env ro&apos;yxatini yaratishdan oldin qo&apos;lda tahrirlashingiz
            mumkin.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Asosiy</TabsTrigger>
          <TabsTrigger value="content">
            Tarkib
            {specLoading && <Loader2 className="h-3 w-3 ml-1.5 animate-spin" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Asosiy ma&apos;lumotlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              <div className="space-y-1.5">
                <Label>Rasm</Label>
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-md overflow-hidden border bg-muted">
                    <Image src={imagePreview} alt="Shablon rasmi" fill className="object-cover" unoptimized />
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
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
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
                  placeholder="Ro'yxatda ko'rinadigan qisqa matn"
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
                <Select
                  value={form.discount_type}
                  onValueChange={(v) => set("discount_type", v as FormState["discount_type"])}
                >
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
                <Label htmlFor="tpl-verify">Darhol tasdiqlash</Label>
              </div>
            </CardContent>
          </Card>

          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Kategoriyalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const active = selectedCategories.includes(c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}>
                        <Badge
                          variant={active ? "default" : "outline"}
                          className="cursor-pointer select-none"
                        >
                          {c.name}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {!project ? (
            <p className="text-sm text-muted-foreground">Avval loyiha tanlang.</p>
          ) : specLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loyihadan tarkib yuklanmoqda…
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Kolleksiyalar (flow ma&apos;lumotlari) loyihaning joriy holatidan avtomatik
                olinadi va bu yerda tahrirlanmaydi. Quyidagi ro&apos;yxatlar shablon bilan
                birga saqlanadigan majburiy/ixtiyoriy kredensial, modul va env talablarini
                belgilaydi.
              </p>

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
                          setCredentials((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))
                        }
                        onRemove={() => setCredentials((prev) => prev.filter((_, j) => j !== i))}
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
                      <span>Slug</span>
                      <span></span>
                      <span></span>
                    </div>
                    {modules.map((m, i) => (
                      <ModuleRow
                        key={i}
                        item={m}
                        onChange={(patch) =>
                          setModules((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))
                        }
                        onRemove={() => setModules((prev) => prev.filter((_, j) => j !== i))}
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
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Yaratilmoqda..." : "Yaratish"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/templates")} disabled={loading}>
          Bekor qilish
        </Button>
      </div>
    </div>
  );
}
