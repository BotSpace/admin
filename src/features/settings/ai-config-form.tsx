"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, RotateCcw, KeyRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
import { type PlatformConfig } from "@/shared/api/services";
import { updateConfigAction } from "./actions";

const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "ollama", label: "Ollama" },
  { value: "gemini", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic" },
  { value: "bedrock", label: "AWS Bedrock" },
] as const;

type AiGroup = {
  provider: string;
  model: string;
  region: string;
  base_url: string;
  /** Draft value typed by admin. Empty means "not changed". */
  api_key_draft: string;
  /** Whether the backend already has an api_key stored. */
  api_key_is_set: boolean;
};

function pickAiGroup(configs: PlatformConfig[]): AiGroup {
  const find = (key: string) =>
    configs.find((c) => c.key === key)?.value ?? "";
  const apiKeyRaw = find("ai_agent.api_key");
  return {
    provider: find("ai_agent.provider"),
    model: find("ai_agent.model"),
    region: find("ai_agent.region"),
    base_url: find("ai_agent.base_url"),
    api_key_draft: "",
    api_key_is_set: apiKeyRaw.length > 0,
  };
}

type Props = {
  configs: PlatformConfig[];
};

export function AiConfigForm({ configs }: Props) {
  const initial = pickAiGroup(configs);
  const [form, setForm] = useState<AiGroup>(initial);
  const [saving, startSave] = useTransition();
  const [resetting, startReset] = useTransition();

  function hasChanged(): boolean {
    return (
      form.provider !== initial.provider ||
      form.model !== initial.model ||
      form.region !== initial.region ||
      form.base_url !== initial.base_url ||
      form.api_key_draft.length > 0
    );
  }

  function handleReset() {
    startReset(() => {
      setForm({ ...initial, api_key_draft: "" });
    });
  }

  function handleSave() {
    const pairs: Array<[string, string]> = [];
    if (form.provider !== initial.provider)
      pairs.push(["ai_agent.provider", form.provider]);
    if (form.model !== initial.model)
      pairs.push(["ai_agent.model", form.model]);
    if (form.region !== initial.region)
      pairs.push(["ai_agent.region", form.region]);
    if (form.base_url !== initial.base_url)
      pairs.push(["ai_agent.base_url", form.base_url]);
    // Only PATCH api_key when admin actually typed a new value.
    if (form.api_key_draft.length > 0)
      pairs.push(["ai_agent.api_key", form.api_key_draft]);

    if (pairs.length === 0) {
      toast.info("O'zgartirishlar yo'q");
      return;
    }

    startSave(async () => {
      const results = await Promise.all(
        pairs.map(([key, value]) => updateConfigAction(key, value))
      );

      const failed = results.filter((r) => !r.ok) as Array<{
        ok: false;
        message: string;
      }>;

      if (failed.length === 0) {
        toast.success("AI sozlamalari saqlandi", {
          description: `${pairs.length} ta sozlama yangilandi`,
        });
        // After saving a new api_key, mark it as set and clear the draft.
        if (form.api_key_draft.length > 0) {
          setForm((prev) => ({
            ...prev,
            api_key_draft: "",
            api_key_is_set: true,
          }));
        }
      } else if (failed.length < results.length) {
        toast.warning("Qisman saqlandi", {
          description: failed.map((f) => f.message).join("; "),
        });
      } else {
        toast.error("Saqlashda xatolik", {
          description: failed[0].message,
        });
      }
    });
  }

  const providerLabel =
    PROVIDER_OPTIONS.find((p) => p.value === form.provider)?.label ??
    form.provider;
  const isBedrock = form.provider === "bedrock";
  const isOpenRouter = form.provider === "openrouter";

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>AI Agent sozlamalari</CardTitle>
        <CardDescription>
          Platforma AI agentining LLM provayder, model va mintaqa sozlamalari.
          O&apos;zgarishlar darhol kuchga kiradi — kodni qayta deploy qilish
          shart emas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider */}
        <div className="space-y-1.5">
          <Label htmlFor="ai-provider">
            Provayder
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
              ai_agent.provider
            </span>
          </Label>
          <Select
            value={form.provider}
            onValueChange={(val) => setForm((prev) => ({ ...prev, provider: val }))}
          >
            <SelectTrigger id="ai-provider" className="w-full">
              <SelectValue placeholder="Provayderni tanlang...">
                {form.provider ? providerLabel : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PROVIDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Hozirgi qiymat: <span className="font-mono">{initial.provider || "—"}</span>
          </p>
        </div>

        {/* Model */}
        <div className="space-y-1.5">
          <Label htmlFor="ai-model">
            Model ID
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
              ai_agent.model
            </span>
          </Label>
          <Input
            id="ai-model"
            value={form.model}
            onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
            placeholder={
              initial.model || "masalan: qwen.qwen3-coder-480b-a35b-v1:0"
            }
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Hozirgi qiymat:{" "}
            <span className="font-mono">{initial.model || "—"}</span>
          </p>
        </div>

        {/* Region — always shown, highlighted when bedrock */}
        <div className="space-y-1.5">
          <Label htmlFor="ai-region">
            Mintaqa (region)
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
              ai_agent.region
            </span>
            {isBedrock && (
              <span className="ml-2 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Bedrock uchun majburiy
              </span>
            )}
          </Label>
          <Input
            id="ai-region"
            value={form.region}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, region: e.target.value }))
            }
            placeholder={initial.region || "masalan: us-west-2"}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Hozirgi qiymat:{" "}
            <span className="font-mono">{initial.region || "—"}</span>
          </p>
        </div>

        {/* Base URL */}
        <div className="space-y-1.5">
          <Label htmlFor="ai-base-url">
            Base URL
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
              ai_agent.base_url
            </span>
            {isOpenRouter && (
              <span className="ml-2 inline-flex items-center rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                OpenRouter uchun tavsiya etiladi
              </span>
            )}
          </Label>
          <Input
            id="ai-base-url"
            value={form.base_url}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, base_url: e.target.value }))
            }
            placeholder={
              isOpenRouter
                ? "https://openrouter.ai/api/v1"
                : initial.base_url || "masalan: https://api.example.com/v1"
            }
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Hozirgi qiymat:{" "}
            <span className="font-mono">{initial.base_url || "—"}</span>
          </p>
        </div>

        {/* API Key — secret field */}
        <div className="space-y-1.5">
          <Label htmlFor="ai-api-key">
            API kalit
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
              ai_agent.api_key
            </span>
            {form.api_key_is_set && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <KeyRound className="h-3 w-3" />
                Saqlangan
              </span>
            )}
          </Label>
          <Input
            id="ai-api-key"
            type="password"
            value={form.api_key_draft}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, api_key_draft: e.target.value }))
            }
            placeholder={
              form.api_key_is_set
                ? "•••••• (saqlangan — o'zgartirish uchun yangi key kiriting)"
                : "API kalitni kiriting..."
            }
            autoComplete="new-password"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {form.api_key_is_set
              ? "Saqlangan kalit ko'rsatilmaydi. Yangi qiymat kiritilganda yangilanadi."
              : "API kalit hali saqlanmagan."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanged()}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving || resetting || !hasChanged()}
          >
            <RotateCcw className="h-4 w-4" />
            Qaytarish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
