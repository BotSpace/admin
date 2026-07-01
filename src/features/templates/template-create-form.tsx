"use client";
import { useEffect, useRef, useState } from "react";
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
import { Separator } from "@/shared/components/ui/separator";
import {
  ImagePlus,
  X,
  Info,
  Loader2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  Rocket,
} from "lucide-react";
import {
  type AdminProject,
  type CredentialTypeInfo,
  type ModuleCatalogItem,
  type TemplateCategory,
  type TemplateSpecCollection,
  type TemplateSpecCredential,
  type TemplateSpecEnv,
  type TemplateSpecModule,
} from "@/shared/api/services";
import {
  createTemplateAction,
  credentialTypesAction,
  modulesCatalogAction,
  previewTemplateSpecAction,
} from "./actions";
import { ProjectPicker } from "./project-picker";
import { CredentialRow, ModuleRow, EnvRow } from "./spec-editors";
import { CollectionDataGrid } from "./collection-data-grid";

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

const STEP_TITLES = ["Loyiha & asosiy", "Kerakli narsalar", "Kolleksiyalar", "Yaratish"] as const;
const LAST_STEP = STEP_TITLES.length - 1;

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Bosqichlar" className="mb-6">
      {/* Desktop: horizontal numbered circles + connecting line */}
      <ol className="hidden sm:flex items-center gap-0">
        {STEP_TITLES.map((title, idx) => {
          const done = idx < current;
          const active = idx === current;
          const isLast = idx === STEP_TITLES.length - 1;
          return (
            <li key={title} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors shrink-0",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30 bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {done ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
                </div>
                <span
                  className={[
                    "text-xs font-medium whitespace-nowrap text-center",
                    active ? "text-foreground" : done ? "text-foreground/70" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {title}
                </span>
              </div>
              {!isLast && (
                <div
                  className={[
                    "h-0.5 flex-1 mx-2 mb-5 transition-colors",
                    done ? "bg-primary" : "bg-muted-foreground/20",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact dots + current step name */}
      <div className="flex sm:hidden items-center gap-3">
        <div className="flex gap-1.5">
          {STEP_TITLES.map((title, idx) => (
            <div
              key={title}
              className={[
                "h-1.5 rounded-full transition-all",
                idx < current ? "w-4 bg-primary" : idx === current ? "w-6 bg-primary" : "w-4 bg-muted-foreground/30",
              ].join(" ")}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {current + 1}/{STEP_TITLES.length} — {STEP_TITLES[current]}
        </span>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Loyiha & asosiy
// ---------------------------------------------------------------------------

function Step1Basic({
  project,
  onProjectChange,
  form,
  set,
  categories,
  selectedCategories,
  toggleCategory,
  imagePreview,
  onFileChange,
  onRemoveImage,
  fileInputRef,
}: {
  project: AdminProject | null;
  onProjectChange: (p: AdminProject | null) => void;
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  categories: TemplateCategory[];
  selectedCategories: number[];
  toggleCategory: (id: number) => void;
  imagePreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Loyiha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ProjectPicker value={project} onChange={onProjectChange} />
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Shablon tarkibi (kredensiallar, modullar, muhit o&apos;zgaruvchilari, kolleksiyalar)
            tanlangan loyihadan avtomatik yig&apos;iladi. Keyingi bosqichlarda qo&apos;lda
            tahrirlashingiz mumkin.
          </p>
        </CardContent>
      </Card>

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
                  onClick={onRemoveImage}
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
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
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
            <Switch id="tpl-verify" checked={form.is_verify} onCheckedChange={(v) => set("is_verify", v)} />
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
                    <Badge variant={active ? "default" : "outline"} className="cursor-pointer select-none">
                      {c.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Kerakli narsalar (credentials / modules / envs)
// ---------------------------------------------------------------------------

function Step2Content({
  project,
  specLoading,
  credentials,
  setCredentials,
  modules,
  setModules,
  envs,
  setEnvs,
  credentialTypes,
  moduleCatalog,
}: {
  project: AdminProject | null;
  specLoading: boolean;
  credentials: TemplateSpecCredential[];
  setCredentials: React.Dispatch<React.SetStateAction<TemplateSpecCredential[]>>;
  modules: TemplateSpecModule[];
  setModules: React.Dispatch<React.SetStateAction<TemplateSpecModule[]>>;
  envs: TemplateSpecEnv[];
  setEnvs: React.Dispatch<React.SetStateAction<TemplateSpecEnv[]>>;
  credentialTypes: CredentialTypeInfo[];
  moduleCatalog: ModuleCatalogItem[];
}) {
  // Type select: core (code/admin) type'lar doim + FAQAT tanlangan modullarning
  // type'lari (module:<slug>). Modul tanlanmaguncha uning type'lari ko'rinmaydi —
  // shuning uchun modullar bo'limi kredensiallardan OLDIN turadi.
  const selectedSlugs = new Set(modules.map((m) => m.slug).filter(Boolean));
  const availableTypes = credentialTypes.filter((t) => {
    if (!t.source?.startsWith("module:")) return true;
    return selectedSlugs.has(t.source.slice(7));
  });

  if (!project) {
    return <p className="text-sm text-muted-foreground">Avval loyiha tanlang.</p>;
  }
  if (specLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loyihadan tarkib yuklanmoqda…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Quyidagi ro&apos;yxatlar shablon bilan birga saqlanadigan majburiy/ixtiyoriy kredensial,
        modul va env talablarini belgilaydi. Loyihadan avtomatik olindi, kerak bo&apos;lsa
        tahrirlang. Avval modullarni belgilang — modul o&apos;zi bilan kredensial type&apos;larini
        olib keladi.
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
                onChange={(patch) => setModules((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
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
              setCredentials((prev) => [...prev, { key: "", type: "", required: true, description: "" }])
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
                onChange={(patch) => setEnvs((prev) => prev.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
                onRemove={() => setEnvs((prev) => prev.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Kolleksiyalar (default ma'lumot)
// ---------------------------------------------------------------------------

function Step3Collections({
  project,
  specLoading,
  collections,
  setCollections,
}: {
  project: AdminProject | null;
  specLoading: boolean;
  collections: TemplateSpecCollection[];
  setCollections: React.Dispatch<React.SetStateAction<TemplateSpecCollection[]>>;
}) {
  if (!project) {
    return <p className="text-sm text-muted-foreground">Avval loyiha tanlang.</p>;
  }
  if (specLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loyihadan kolleksiyalar yuklanmoqda…
      </div>
    );
  }

  const editable = collections.filter((c) => !c.system);
  const system = collections.filter((c) => c.system);

  if (collections.length === 0) {
    return <p className="text-sm text-muted-foreground">Loyihada kolleksiyalar topilmadi.</p>;
  }

  function updateData(name: string, data: Record<string, unknown>[]) {
    setCollections((prev) => prev.map((c) => (c.name === name ? { ...c, data } : c)));
  }

  return (
    <div className="space-y-6">
      {editable.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tahrirlash mumkin bo&apos;lgan kolleksiyalar yo&apos;q.</p>
      ) : (
        editable.map((c) => (
          <div key={c.name} className="space-y-2">
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Bu yerga kiritilgan ma&apos;lumot shablondan yaratilgan botda paydo bo&apos;ladi.
            </p>
            {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
            <CollectionDataGrid collection={c} onChange={(data) => updateData(c.name, data)} />
          </div>
        ))
      )}

      {system.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Tizim kolleksiyalari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {system.map((c) => (
                <Badge key={c.name} variant="outline">
                  {c.label || c.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Tizim kolleksiyasi — shablon ma&apos;lumoti bilan boshlang&apos;ich to&apos;ldirilmaydi.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Yaratish (summary + submit)
// ---------------------------------------------------------------------------

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2.5 text-center">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Step4Confirm({
  project,
  form,
  credentials,
  modules,
  envs,
  collections,
}: {
  project: AdminProject | null;
  form: FormState;
  credentials: TemplateSpecCredential[];
  modules: TemplateSpecModule[];
  envs: TemplateSpecEnv[];
  collections: TemplateSpecCollection[];
}) {
  const editableCollections = collections.filter((c) => !c.system);
  const totalRows = editableCollections.reduce((sum, c) => sum + (c.data?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Ma&apos;lumotlarni tekshiring va shablonni yarating.
      </p>

      <div className="rounded-xl border bg-muted/30 divide-y">
        <SummaryRow label="Nomi" value={form.name || "—"} />
        <SummaryRow label="Loyiha" value={project ? project.name : "—"} />
        <SummaryRow
          label="Narxi"
          value={form.original_price ? `${form.original_price} so'm` : "—"}
        />
        {form.discount && (
          <SummaryRow
            label="Chegirma"
            value={`${form.discount}${form.discount_type === "percent" ? "%" : " so'm"}`}
          />
        )}
        <SummaryRow label="Tasdiqlash" value={form.is_verify ? "Darhol tasdiqlanadi" : "Tekshiruv kutiladi"} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Kredensiallar" value={credentials.length} />
        <StatCard label="Modullar" value={modules.length} />
        <StatCard label="Env" value={envs.length} />
        <StatCard label="Kolleksiyalar" value={`${editableCollections.length} (${totalRows})`} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export function TemplateCreateForm({ categories }: { categories: TemplateCategory[] }) {
  const router = useRouter();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Spec editors (steps 2 & 3) — pre-filled from the selected project via
  // preview-spec, then freely editable before submit.
  const [credentials, setCredentials] = useState<TemplateSpecCredential[]>([]);
  const [modules, setModules] = useState<TemplateSpecModule[]>([]);
  const [envs, setEnvs] = useState<TemplateSpecEnv[]>([]);
  const [collections, setCollections] = useState<TemplateSpecCollection[]>([]);
  const [specLoading, setSpecLoading] = useState(false);
  const specReqId = useRef(0);

  const [stepIndex, setStepIndex] = useState(0);

  // Registrlar: credential type'lar (code/admin/module) + modul katalogi —
  // step 2 select'lari uchun bir marta yuklanadi.
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeInfo[]>([]);
  const [moduleCatalog, setModuleCatalog] = useState<ModuleCatalogItem[]>([]);
  useEffect(() => {
    void credentialTypesAction().then((r) => {
      if (r.ok) setCredentialTypes(r.data);
    });
    void modulesCatalogAction().then((r) => {
      if (r.ok) setModuleCatalog(r.data);
    });
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleProjectChange(p: AdminProject | null) {
    setProject(p);
    if (!p) {
      setCredentials([]);
      setModules([]);
      setEnvs([]);
      setCollections([]);
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
      setCollections(res.data.collections ?? []);
    } else {
      toast.error(res.message);
    }
  }

  function toggleCategory(id: number) {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
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

  const stepValid: boolean[] = [
    !!project && form.name.trim().length > 0 && form.original_price.trim().length > 0,
    true,
    true,
    true,
  ];

  function goBack() {
    if (stepIndex === 0) {
      router.push("/templates");
      return;
    }
    setStepIndex((i) => i - 1);
  }

  function goNext() {
    if (!stepValid[stepIndex]) return;
    setStepIndex((i) => Math.min(i + 1, LAST_STEP));
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
        spec_overrides: { credentials, modules, envs, collections },
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

  const isLastStep = stepIndex === LAST_STEP;

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Stepper current={stepIndex} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground shrink-0 -mt-1"
          onClick={() => router.push("/templates")}
          disabled={loading}
        >
          Bekor qilish
        </Button>
      </div>

      <div className="min-h-[240px]">
        {stepIndex === 0 && (
          <Step1Basic
            project={project}
            onProjectChange={handleProjectChange}
            form={form}
            set={set}
            categories={categories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            imagePreview={imagePreview}
            onFileChange={handleFileChange}
            onRemoveImage={handleRemoveImage}
            fileInputRef={fileInputRef}
          />
        )}

        {stepIndex === 1 && (
          <Step2Content
            project={project}
            specLoading={specLoading}
            credentials={credentials}
            setCredentials={setCredentials}
            modules={modules}
            setModules={setModules}
            envs={envs}
            setEnvs={setEnvs}
            credentialTypes={credentialTypes}
            moduleCatalog={moduleCatalog}
          />
        )}

        {stepIndex === 2 && (
          <Step3Collections
            project={project}
            specLoading={specLoading}
            collections={collections}
            setCollections={setCollections}
          />
        )}

        {stepIndex === 3 && (
          <Step4Confirm
            project={project}
            form={form}
            credentials={credentials}
            modules={modules}
            envs={envs}
            collections={collections}
          />
        )}
      </div>

      <Separator className="my-6" />

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={goBack} disabled={loading} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>

        {isLastStep ? (
          <Button type="button" onClick={handleSubmit} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            Yaratish
          </Button>
        ) : (
          <Button type="button" onClick={goNext} disabled={!stepValid[stepIndex]} className="gap-1.5">
            Keyingi
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
