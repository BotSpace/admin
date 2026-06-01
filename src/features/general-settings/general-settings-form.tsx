"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, ChevronDown, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { type SettingGroup } from "@/shared/api/services";
import { setSettingAction } from "./actions";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Encode value[] as a comma-separated display string for the input */
function encode(value: string[]): string {
  return value.join(", ");
}

/** Split comma-separated input back into string[] */
function decode(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Option row ────────────────────────────────────────────────────────────────

type OptionRowProps = {
  settingsKey: string;
  optionKey: string;
  initialValue: string[];
  /** Highlight this row as the primary/important setting */
  primary?: boolean;
};

function OptionRow({ settingsKey, optionKey, initialValue, primary }: OptionRowProps) {
  const [draft, setDraft] = useState<string>(encode(initialValue));
  const [saving, startSave] = useTransition();

  const isDirty = draft !== encode(initialValue);

  function handleSave() {
    if (!isDirty) {
      toast.info("O'zgartirishlar yo'q");
      return;
    }
    startSave(async () => {
      const result = await setSettingAction(settingsKey, optionKey, decode(draft));
      if (result.ok) {
        toast.success("Saqlandi", {
          description: `${settingsKey}.${optionKey} yangilandi`,
        });
      } else {
        toast.error("Saqlashda xatolik", { description: result.message });
      }
    });
  }

  const inputId = `setting-${settingsKey}-${optionKey}`;

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        primary
          ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
          : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor={inputId} className="flex items-center gap-2">
            {primary && <Tag className="h-3.5 w-3.5 text-primary shrink-0" />}
            <span className="font-mono text-sm font-semibold">{optionKey}</span>
            {primary && (
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/20">
                asosiy
              </span>
            )}
          </Label>
          <Input
            id={inputId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="font-mono text-sm"
            placeholder="qiymat kiriting..."
          />
          {initialValue.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Bir nechta qiymat vergul bilan ajrating.
              Hozirgi:{" "}
              <span className="font-mono">{encode(initialValue) || "—"}</span>
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="mt-6 shrink-0"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
}

// ── Group card ────────────────────────────────────────────────────────────────

type GroupCardProps = {
  group: SettingGroup;
};

function GroupCard({ group }: GroupCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="font-mono text-base">{group.key}</CardTitle>
            {group.description && (
              <CardDescription>{group.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!group.is_public && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                private
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {group.options.length} ta sozlama
            </span>
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-3 pt-0">
          {group.options.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bu guruhda sozlamalar yo&apos;q.
            </p>
          ) : (
            group.options.map((opt) => {
              // engine/version is the most-used setting — highlight it
              const isPrimary =
                group.key === "engine" && opt.key === "version";
              return (
                <OptionRow
                  key={opt.key}
                  settingsKey={group.key}
                  optionKey={opt.key}
                  initialValue={opt.value}
                  primary={isPrimary}
                />
              );
            })
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

type Props = {
  settings: SettingGroup[];
};

export function GeneralSettingsForm({ settings }: Props) {
  if (settings.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center text-muted-foreground">
        Hozircha hech qanday sozlama mavjud emas.
      </div>
    );
  }

  // Put "engine" group first so it is immediately visible
  const sorted = [...settings].sort((a, b) => {
    if (a.key === "engine") return -1;
    if (b.key === "engine") return 1;
    return a.key.localeCompare(b.key);
  });

  return (
    <div className="max-w-2xl space-y-4">
      {sorted.map((group) => (
        <GroupCard key={group.key} group={group} />
      ))}
    </div>
  );
}
