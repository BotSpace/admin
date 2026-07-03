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
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { type AdminTemplateDetail, type TemplateCategory } from "@/shared/api/services";
import { updateTemplateAction } from "./actions";
import { normalizeUrl } from "./template-create-form";
import { Pencil } from "lucide-react";

type FormState = {
  name: string;
  short_description: string;
  description: string;
  image: string;
  video: string;
  original_price: string;
  discount: string;
  discount_type: "percent" | "amount";
  demo_url: string;
  is_verify: boolean;
};

function templateToForm(t: AdminTemplateDetail): FormState {
  return {
    name: t.name,
    short_description: t.short_description ?? "",
    description: t.description ?? "",
    image: t.image ?? "",
    video: t.video ?? "",
    original_price: t.original_price ?? "",
    discount: t.discount ?? "",
    discount_type: (t.discount_type as FormState["discount_type"]) || "percent",
    demo_url: t.demo_url ?? "",
    is_verify: t.is_verify,
  };
}

export function TemplateEditDialog({
  template,
  categories = [],
}: {
  template: AdminTemplateDetail;
  categories?: TemplateCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(templateToForm(template));
  const [categoryIds, setCategoryIds] = useState<string[]>(template.categories.map((c) => c.id));
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Shablon nomini kiriting");
      return;
    }
    setLoading(true);
    const res = await updateTemplateAction(template.id, {
      name: form.name.trim(),
      short_description: form.short_description.trim() || undefined,
      description: form.description.trim() || undefined,
      image: form.image.trim() || undefined,
      video: normalizeUrl(form.video),
      original_price: form.original_price.trim() || undefined,
      discount: form.discount.trim() || undefined,
      discount_type: form.discount_type,
      demo_url: normalizeUrl(form.demo_url),
      is_verify: form.is_verify,
      category_ids: categoryIds,
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Shablon yangilandi");
      setOpen(false);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Tahrirlash
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shablonni tahrirlash</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-tpl-name">Nomi</Label>
            <Input id="edit-tpl-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tpl-short">Qisqa tavsif</Label>
            <Input
              id="edit-tpl-short"
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tpl-desc">Tavsif</Label>
            <Textarea
              id="edit-tpl-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tpl-image">Rasm (URL yoki storage yo&apos;li)</Label>
            <Input id="edit-tpl-image" value={form.image} onChange={(e) => set("image", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tpl-video">Video URL</Label>
            <Input id="edit-tpl-video" value={form.video} onChange={(e) => set("video", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tpl-demo">Demo URL</Label>
            <Input id="edit-tpl-demo" value={form.demo_url} onChange={(e) => set("demo_url", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-tpl-price">Narxi (so&apos;m)</Label>
              <Input
                id="edit-tpl-price"
                type="number"
                value={form.original_price}
                onChange={(e) => set("original_price", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-tpl-discount">Chegirma</Label>
              <Input
                id="edit-tpl-discount"
                type="number"
                value={form.discount}
                onChange={(e) => set("discount", e.target.value)}
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
                <SelectItem value="amount">Summa (so&apos;m)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {categories.length > 0 && (
            <div className="space-y-1.5">
              <Label>Kategoriyalar</Label>
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
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch checked={form.is_verify} onCheckedChange={(v) => set("is_verify", v)} />
            <Label>Tasdiqlangan</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
