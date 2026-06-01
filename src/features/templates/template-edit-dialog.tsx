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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { type AdminTemplateDetail } from "@/shared/api/services";
import { updateTemplateAction } from "./actions";
import { Pencil } from "lucide-react";

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

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handle() {
    if (!form.name.trim()) {
      toast.error("Shablon nomini kiriting");
      return;
    }
    setLoading(true);
    const res = await updateTemplateAction(template.id, {
      name: form.name.trim(),
      short_description: form.short_description.trim() || undefined,
      description: form.description.trim() || undefined,
      original_price: form.original_price.trim() || undefined,
      discount: form.discount.trim() || undefined,
      discount_type: form.discount_type || undefined,
      demo_url: form.demo_url.trim() || undefined,
      is_verify: form.is_verify,
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
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-1" />
          Tahrirlash
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shablonni tahrirlash</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
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
                <SelectItem value="fixed">Miqdor (so&apos;m)</SelectItem>
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
