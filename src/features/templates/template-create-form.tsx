"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { type AdminProject, type TemplateCategory } from "@/shared/api/services";
import { createTemplateAction } from "./actions";
import { ProjectPicker } from "./project-picker";

// "t.me/bot" kabi schemasiz URL backend URLField'da 400 beradi — https:// qo'shamiz.
export function normalizeUrl(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

type FormState = {
  name: string;
  slug: string;
  image: string;
  video: string;
  short_description: string;
  description: string;
  original_price: string;
  discount: string;
  discount_type: "percent" | "amount";
  demo_url: string;
  author_id: string;
  is_verify: boolean;
};

const initialForm: FormState = {
  name: "",
  slug: "",
  image: "",
  video: "",
  short_description: "",
  description: "",
  original_price: "",
  discount: "",
  discount_type: "percent",
  demo_url: "",
  author_id: "",
  is_verify: false,
};

export function TemplateCreateForm({ categories }: { categories: TemplateCategory[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [project, setProject] = useState<AdminProject | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Shablon nomini kiriting");
      return;
    }
    setLoading(true);
    const res = await createTemplateAction({
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      author_id: form.author_id.trim() || undefined,
      project_id: project?.id,
      image: form.image.trim() || undefined,
      video: normalizeUrl(form.video),
      short_description: form.short_description.trim() || undefined,
      description: form.description.trim() || undefined,
      original_price: form.original_price.trim() || undefined,
      discount: form.discount.trim() || undefined,
      discount_type: form.discount_type,
      demo_url: normalizeUrl(form.demo_url),
      is_verify: form.is_verify,
      category_ids: categoryIds.length ? categoryIds : undefined,
    });
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
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Asosiy ma&apos;lumotlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tpl-name">Nomi</Label>
              <Input
                id="tpl-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Masalan: QR menu va buyurtma servisi"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-slug">Slug (ixtiyoriy)</Label>
              <Input
                id="tpl-slug"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="avtomatik yaratiladi"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-author">Muallif ID (ixtiyoriy, UUID)</Label>
              <Input
                id="tpl-author"
                value={form.author_id}
                onChange={(e) => set("author_id", e.target.value)}
                placeholder="bo'sh — muallifsiz yaratiladi"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tpl-short">Qisqa tavsif</Label>
              <Input
                id="tpl-short"
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                placeholder="Ro'yxatda ko'rinadigan qisqa matn"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="tpl-desc">Tavsif</Label>
              <Textarea
                id="tpl-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Batafsil tavsif..."
                rows={5}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-image">Rasm (URL yoki storage yo&apos;li)</Label>
              <Input
                id="tpl-image"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://... yoki template/cover.png"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-video">Video URL (ixtiyoriy)</Label>
              <Input
                id="tpl-video"
                value={form.video}
                onChange={(e) => set("video", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-demo">Demo URL (ixtiyoriy)</Label>
              <Input
                id="tpl-demo"
                value={form.demo_url}
                onChange={(e) => set("demo_url", e.target.value)}
                placeholder="t.me/bot yoki https://..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Bog'langan loyiha (ixtiyoriy)</Label>
              <ProjectPicker value={project} onChange={setProject} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Narx</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-price">Narxi (so&apos;m)</Label>
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
                  <SelectItem value="amount">Summa (so&apos;m)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                const active = categoryIds.includes(c.id);
                return (
                  <Badge
                    key={c.id}
                    variant={active ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleCategory(c.id)}
                  >
                    {c.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_verify} onCheckedChange={(v) => set("is_verify", v)} />
            <Label>Darhol tasdiqlangan holatda yaratish</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Yaratilmoqda..." : "Shablonni yaratish"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/templates")} disabled={loading}>
          Bekor qilish
        </Button>
      </div>
    </div>
  );
}
