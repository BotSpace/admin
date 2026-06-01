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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { type TemplateSubmission } from "@/shared/api/services";
import { updateSubmissionAction } from "./actions";
import { Pencil } from "lucide-react";

type FormState = {
  name: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  note: string;
};

function submissionToForm(s: TemplateSubmission): FormState {
  return {
    name: s.name ?? s.template_name ?? "",
    description: s.description ?? "",
    status: s.status,
    note: s.note ?? "",
  };
}

export function SubmissionEditDialog({ submission }: { submission: TemplateSubmission }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(submissionToForm(submission));
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handle() {
    if (!form.name.trim()) {
      toast.error("So'rov nomini kiriting");
      return;
    }
    setLoading(true);
    const res = await updateSubmissionAction(submission.id, {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      note: form.note.trim() || undefined,
    });
    setLoading(false);
    if (res.ok) {
      toast.success("So'rov yangilandi");
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
          <DialogTitle>So&apos;rovni tahrirlash</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="sub-name">Nomi</Label>
            <Input
              id="sub-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="So'rov nomi"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sub-desc">Tavsif</Label>
            <Textarea
              id="sub-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tavsif..."
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Holat</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as FormState["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Kutmoqda</SelectItem>
                <SelectItem value="approved">Tasdiqlangan</SelectItem>
                <SelectItem value="rejected">Rad etilgan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sub-note">Izoh</Label>
            <Input
              id="sub-note"
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Izoh (ixtiyoriy)..."
            />
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
