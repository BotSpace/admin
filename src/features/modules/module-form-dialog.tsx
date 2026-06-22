"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
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
import { type AdminModule } from "@/shared/api/services";
import { createModuleAction, updateModuleAction } from "./actions";

type FormState = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  github_url: string;
  image: string;
  port: string;
  auth_token: string;
  active: boolean;
};

const defaultForm: FormState = {
  slug: "",
  name: "",
  description: "",
  icon: "",
  github_url: "",
  image: "",
  port: "",
  auth_token: "",
  active: true,
};

function moduleToForm(m: AdminModule): FormState {
  return {
    slug: m.slug,
    name: m.name,
    description: m.description ?? "",
    icon: m.icon ?? "",
    github_url: m.github_url ?? "",
    image: m.image ?? "",
    port: m.port ? String(m.port) : "",
    auth_token: "",
    active: m.active,
  };
}

type Props = {
  module?: AdminModule;
};

export function ModuleFormDialog({ module: mod }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(mod ? moduleToForm(mod) : defaultForm);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(mod);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handle() {
    if (!form.slug.trim()) { toast.error("Slug kiriting"); return; }
    if (!form.name.trim()) { toast.error("Modul nomini kiriting"); return; }
    setLoading(true);
    const body = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description || undefined,
      icon: form.icon || undefined,
      github_url: form.github_url || undefined,
      image: form.image || undefined,
      port: form.port ? Number(form.port) : undefined,
      auth_token: form.auth_token || undefined,
      active: form.active,
    };
    const res = isEdit
      ? await updateModuleAction(mod!.slug, body)
      : await createModuleAction(body);
    setLoading(false);
    if (res.ok) {
      toast.success(isEdit ? "Modul yangilandi" : "Modul qo'shildi");
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
            <Plus className="h-4 w-4 mr-1" />
            Modul qo&apos;shish
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        // Don't dismiss while filling the form (outside click / opening click).
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modulni tahrirlash" : "Yangi modul"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1">
            <Label>Slug <span className="text-destructive">*</span></Label>
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="my-module"
              disabled={isEdit}
            />
          </div>
          <div className="space-y-1">
            <Label>Nomi <span className="text-destructive">*</span></Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="My Module"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Tavsif</Label>
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Modul haqida qisqacha..."
            />
          </div>
          <div className="space-y-1">
            <Label>Icon (emoji yoki URL)</Label>
            <Input
              value={form.icon}
              onChange={(e) => set("icon", e.target.value)}
              placeholder="🤖 yoki https://..."
            />
          </div>
          <div className="space-y-1">
            <Label>Port</Label>
            <Input
              type="number"
              value={form.port}
              onChange={(e) => set("port", e.target.value)}
              placeholder="3000"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>GitHub URL</Label>
            <Input
              value={form.github_url}
              onChange={(e) => set("github_url", e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Image (Docker)</Label>
            <Input
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="ghcr.io/org/image:latest"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Auth token</Label>
            <Input
              type="password"
              value={form.auth_token}
              onChange={(e) => set("auth_token", e.target.value)}
              placeholder={isEdit ? "O'zgartirmaslik uchun bo'sh qoldiring" : ""}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
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
