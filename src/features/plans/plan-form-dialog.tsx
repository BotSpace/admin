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
  max_users: string;
  max_bots: string;
  max_input_tokens: string;
  max_output_tokens: string;
  custom_domain: boolean;
  priority_support: boolean;
  description: string;
  is_top: boolean;
  is_active: boolean;
  order: string;
};

const defaultForm: FormState = {
  name: "",
  price: "0",
  max_users: "0",
  max_bots: "0",
  max_input_tokens: "0",
  max_output_tokens: "0",
  custom_domain: false,
  priority_support: false,
  description: "",
  is_top: false,
  is_active: true,
  order: "0",
};

function planToForm(plan: Plan): FormState {
  return {
    name: plan.name,
    price: plan.price,
    max_users: String(plan.max_users),
    max_bots: String(plan.max_bots),
    max_input_tokens: String(plan.max_input_tokens),
    max_output_tokens: String(plan.max_output_tokens),
    custom_domain: plan.custom_domain,
    priority_support: plan.priority_support,
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
      max_users: Number(form.max_users),
      max_bots: Number(form.max_bots),
      max_input_tokens: Number(form.max_input_tokens),
      max_output_tokens: Number(form.max_output_tokens),
      custom_domain: form.custom_domain,
      priority_support: form.priority_support,
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
            <Label>Max foydalanuvchilar</Label>
            <Input type="number" value={form.max_users} onChange={(e) => set("max_users", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Max botlar</Label>
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
            <Switch checked={form.custom_domain} onCheckedChange={(v) => set("custom_domain", v)} />
            <Label>Maxsus domen</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.priority_support} onCheckedChange={(v) => set("priority_support", v)} />
            <Label>Ustuvor qo&apos;llab-quvvatlash</Label>
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
