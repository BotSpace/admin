"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, RotateCcw } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { type GeneralSettings } from "@/shared/api/services";
import { updateGeneralSettingsAction } from "./actions";

const LANGUAGES = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Ruscha" },
  { value: "en", label: "Inglizcha" },
];

type Props = {
  settings: GeneralSettings;
};

export function GeneralSettingsForm({ settings }: Props) {
  const [form, setForm] = useState<GeneralSettings>(settings);
  const [saving, startSave] = useTransition();

  const isDirty = JSON.stringify(form) !== JSON.stringify(settings);

  function handleReset() {
    setForm(settings);
  }

  function handleSave() {
    if (!isDirty) {
      toast.info("O'zgartirishlar yo'q");
      return;
    }
    startSave(async () => {
      const result = await updateGeneralSettingsAction(form);
      if (result.ok) {
        toast.success("Saqlandi", { description: "Umumiy sozlamalar yangilandi" });
        setForm(result.data);
      } else {
        toast.error("Saqlashda xatolik", { description: result.message });
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Platforma sozlamalari</CardTitle>
        <CardDescription>Sayt nomi, aloqa ma&apos;lumotlari va umumiy parametrlar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="site-name">
            Sayt nomi
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">site_name</span>
          </Label>
          <Input
            id="site-name"
            value={form.site_name}
            onChange={(e) => setForm((p) => ({ ...p, site_name: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="support-email">
              Qo&apos;llab-quvvatlash email
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">support_email</span>
            </Label>
            <Input
              id="support-email"
              type="email"
              value={form.support_email}
              onChange={(e) => setForm((p) => ({ ...p, support_email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="support-phone">
              Qo&apos;llab-quvvatlash telefon
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">support_phone</span>
            </Label>
            <Input
              id="support-phone"
              value={form.support_phone}
              onChange={(e) => setForm((p) => ({ ...p, support_phone: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="default-language">
              Standart til
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">default_language</span>
            </Label>
            <Select
              value={form.default_language}
              onValueChange={(v) => setForm((p) => ({ ...p, default_language: v }))}
            >
              <SelectTrigger id="default-language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="commission-percent">
              Komissiya foizi
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">commission_percent</span>
            </Label>
            <Input
              id="commission-percent"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={form.commission_percent}
              onChange={(e) => setForm((p) => ({ ...p, commission_percent: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance-mode">
              Texnik xizmat rejimi
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">maintenance_mode</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Yoqilganda platforma foydalanuvchilar uchun vaqtincha yopiladi.
            </p>
          </div>
          <Switch
            id="maintenance-mode"
            checked={form.maintenance_mode}
            onCheckedChange={(checked) => setForm((p) => ({ ...p, maintenance_mode: checked }))}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving || !isDirty}>
            <Save className="h-4 w-4" />
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={saving || !isDirty}>
            <RotateCcw className="h-4 w-4" />
            Qaytarish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
