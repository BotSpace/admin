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
import { type Plan } from "@/shared/api/services";
import { createPlanAction, updatePlanAction } from "./actions";
import { Plus, Pencil } from "lucide-react";

type FormState = {
  name: string;
  price: string;
  max_bots: string;
  max_input_tokens: string;
  max_output_tokens: string;
  description: string;
  is_top: boolean;
  is_active: boolean;
  order: string;
};

const defaultForm: FormState = {
  name: "",
  price: "0",
  max_bots: "1",
  max_input_tokens: "800000",
  max_output_tokens: "200000",
  description: "",
  is_top: false,
  is_active: true,
  order: "0",
};

function planToForm(plan: Plan): FormState {
  return {
    name: plan.name,
    price: plan.price,
    max_bots: String(plan.max_bots),
    max_input_tokens: String(plan.max_input_tokens),
    max_output_tokens: String(plan.max_output_tokens),
    description: plan.description ?? "",
    is_top: plan.is_top,
    is_active: plan.is_active,
    order: String(plan.order),
  };
}

type Props = {
  plan?: Plan;
};

export function PlanFormDialog({ plan }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(plan ? planToForm(plan) : defaultForm);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(plan);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handle() {
    if (!form.name.trim()) { toast.error("Tarif nomini kiriting"); return; }
    setLoading(true);
    const body = {
      name: form.name,
      price: form.price,
      max_bots: Number(form.max_bots),
      max_input_tokens: Number(form.max_input_tokens),
      max_output_tokens: Number(form.max_output_tokens),
      description: form.description || undefined,
      is_top: form.is_top,
      is_active: form.is_active,
      order: Number(form.order),
    };
    const res = isEdit
      ? await updatePlanAction(plan!.id, body)
      : await createPlanAction(body);
    setLoading(false);
    if (res.ok) {
      toast.success(isEdit ? "Tarif yangilandi" : "Tarif yaratildi");
      setOpen(false);
      if (!isEdit) setForm(defaultForm);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4" /> Yangi tarif
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Tarifni tahrirlash" : "Yangi tarif"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2 space-y-1">
            <Label>Nomi</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Basic" />
          </div>
          <div className="space-y-1">
            <Label>Narxi (UZS)</Label>
            <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Tartib raqami</Label>
            <Input type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Max botlar (0 = cheksiz)</Label>
            <Input type="number" value={form.max_bots} onChange={(e) => set("max_bots", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Max kirish tokenlar</Label>
            <Input type="number" value={form.max_input_tokens} onChange={(e) => set("max_input_tokens", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Max chiqish tokenlar</Label>
            <Input type="number" value={form.max_output_tokens} onChange={(e) => set("max_output_tokens", e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Tavsif</Label>
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ixtiyoriy..." />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_top} onCheckedChange={(v) => set("is_top", v)} />
            <Label>Top tarif</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
            <Label>Faol</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handle} disabled={loading}>
            {loading ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
