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

// ── Provider catalogue ────────────────────────────────────────────────────────

const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "ollama", label: "Ollama" },
  { value: "gemini", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic" },
  { value: "bedrock", label: "AWS Bedrock" },
] as const;

type Provider = (typeof PROVIDER_OPTIONS)[number]["value"];

/** Default base_url for each provider. Bedrock has none. */
const PROVIDER_BASE_URL_DEFAULTS: Partial<Record<Provider, string>> = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  ollama: "https://ollama.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/",
  anthropic: "https://api.anthropic.com",
};

/** Which fields are visible per provider. model is always visible. */
type ProviderFields = {
  api_key: boolean;
  base_url: boolean;
  region: boolean;
  aws_access_key_id: boolean;
  aws_secret_access_key: boolean;
};

function getProviderFields(provider: string): ProviderFields {
  if (provider === "bedrock") {
    return {
      api_key: false,
      base_url: false,
      region: true,
      aws_access_key_id: true,
      aws_secret_access_key: true,
    };
  }
  return {
    api_key: true,
    base_url: true,
    region: false,
    aws_access_key_id: false,
    aws_secret_access_key: false,
  };
}

// ── Form state ────────────────────────────────────────────────────────────────

type AiGroup = {
  provider: string;
  model: string;
  region: string;
  base_url: string;
  // api_key
  api_key_draft: string;
  api_key_is_set: boolean;
  // aws_access_key_id
  aws_access_key_id_draft: string;
  aws_access_key_id_is_set: boolean;
  // aws_secret_access_key
  aws_secret_access_key_draft: string;
  aws_secret_access_key_is_set: boolean;
};

function pickAiGroup(configs: PlatformConfig[]): AiGroup {
  const find = (key: string) =>
    configs.find((c) => c.key === key)?.value ?? "";
  return {
    provider: find("ai_agent.provider"),
    model: find("ai_agent.model"),
    region: find("ai_agent.region"),
    base_url: find("ai_agent.base_url"),
    api_key_draft: "",
    api_key_is_set: find("ai_agent.api_key").length > 0,
    aws_access_key_id_draft: "",
    aws_access_key_id_is_set: find("ai_agent.aws_access_key_id").length > 0,
    aws_secret_access_key_draft: "",
    aws_secret_access_key_is_set:
      find("ai_agent.aws_secret_access_key").length > 0,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  configs: PlatformConfig[];
};

export function AiConfigForm({ configs }: Props) {
  const initial = pickAiGroup(configs);
  const [form, setForm] = useState<AiGroup>(initial);
  const [saving, startSave] = useTransition();
  const [resetting, startReset] = useTransition();

  const fields = getProviderFields(form.provider);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function hasChanged(): boolean {
    return (
      form.provider !== initial.provider ||
      form.model !== initial.model ||
      form.region !== initial.region ||
      form.base_url !== initial.base_url ||
      form.api_key_draft.length > 0 ||
      form.aws_access_key_id_draft.length > 0 ||
      form.aws_secret_access_key_draft.length > 0
    );
  }

  function handleReset() {
    startReset(() => {
      setForm({
        ...initial,
        api_key_draft: "",
        aws_access_key_id_draft: "",
        aws_secret_access_key_draft: "",
      });
    });
  }

  // When provider changes, auto-fill base_url with the new provider's default
  // only if the current base_url is still equal to the previous provider's
  // default (i.e. the admin hasn't typed a custom value).
  function handleProviderChange(next: string) {
    setForm((prev) => {
      const prevDefault =
        PROVIDER_BASE_URL_DEFAULTS[prev.provider as Provider] ?? "";
      const nextDefault =
        PROVIDER_BASE_URL_DEFAULTS[next as Provider] ?? "";

      // Determine the new base_url:
      //  - if current value is empty OR equals the previous provider's default
      //    → replace with the new default
      //  - otherwise the admin typed a custom value → keep it
      const isCustom =
        prev.base_url !== "" && prev.base_url !== prevDefault;
      const newBaseUrl = isCustom ? prev.base_url : nextDefault;

      return { ...prev, provider: next, base_url: newBaseUrl };
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

    // Secret fields: only PATCH when the admin actually typed something.
    if (form.api_key_draft.length > 0)
      pairs.push(["ai_agent.api_key", form.api_key_draft]);
    if (form.aws_access_key_id_draft.length > 0)
      pairs.push(["ai_agent.aws_access_key_id", form.aws_access_key_id_draft]);
    if (form.aws_secret_access_key_draft.length > 0)
      pairs.push([
        "ai_agent.aws_secret_access_key",
        form.aws_secret_access_key_draft,
      ]);

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
        // After save: clear all drafts and mark saved secrets as set.
        setForm((prev) => {
          const patch: Partial<AiGroup> = {
            api_key_draft: "",
            aws_access_key_id_draft: "",
            aws_secret_access_key_draft: "",
          };
          if (form.api_key_draft.length > 0) patch.api_key_is_set = true;
          if (form.aws_access_key_id_draft.length > 0)
            patch.aws_access_key_id_is_set = true;
          if (form.aws_secret_access_key_draft.length > 0)
            patch.aws_secret_access_key_is_set = true;
          return { ...prev, ...patch };
        });
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

  // ── Shared secret-field renderer ─────────────────────────────────────────

  function SecretField({
    id,
    label,
    configKey,
    draft,
    isSet,
    onChange,
    placeholderSet,
    placeholderEmpty,
    hint,
  }: {
    id: string;
    label: string;
    configKey: string;
    draft: string;
    isSet: boolean;
    onChange: (val: string) => void;
    placeholderSet: string;
    placeholderEmpty: string;
    hint: string;
  }) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>
          {label}
          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
            {configKey}
          </span>
          {isSet && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <KeyRound className="h-3 w-3" />
              Saqlangan
            </span>
          )}
        </Label>
        <Input
          id={id}
          type="password"
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSet ? placeholderSet : placeholderEmpty}
          autoComplete="new-password"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const providerLabel =
    PROVIDER_OPTIONS.find((p) => p.value === form.provider)?.label ??
    form.provider;

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
          <Select value={form.provider} onValueChange={handleProviderChange}>
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
            Hozirgi qiymat:{" "}
            <span className="font-mono">{initial.provider || "—"}</span>
          </p>
        </div>

        {/* Model — always visible */}
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
            onChange={(e) =>
              setForm((prev) => ({ ...prev, model: e.target.value }))
            }
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

        {/* Region — only for Bedrock */}
        {fields.region && (
          <div className="space-y-1.5">
            <Label htmlFor="ai-region">
              Mintaqa (region)
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                ai_agent.region
              </span>
              <span className="ml-2 inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Bedrock uchun majburiy
              </span>
            </Label>
            <Input
              id="ai-region"
              value={form.region}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, region: e.target.value }))
              }
              placeholder={initial.region || "us-west-2"}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Hozirgi qiymat:{" "}
              <span className="font-mono">{initial.region || "—"}</span>
            </p>
          </div>
        )}

        {/* Base URL — not for Bedrock */}
        {fields.base_url && (
          <div className="space-y-1.5">
            <Label htmlFor="ai-base-url">
              Base URL
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                ai_agent.base_url
              </span>
            </Label>
            <Input
              id="ai-base-url"
              value={form.base_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, base_url: e.target.value }))
              }
              placeholder={
                PROVIDER_BASE_URL_DEFAULTS[form.provider as Provider] ||
                "masalan: https://api.example.com/v1"
              }
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Hozirgi qiymat:{" "}
              <span className="font-mono">{initial.base_url || "—"}</span>
            </p>
          </div>
        )}

        {/* API Key — not for Bedrock */}
        {fields.api_key && (
          <SecretField
            id="ai-api-key"
            label="API kalit"
            configKey="ai_agent.api_key"
            draft={form.api_key_draft}
            isSet={form.api_key_is_set}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, api_key_draft: val }))
            }
            placeholderSet="•••••• (saqlangan — o'zgartirish uchun yangi key kiriting)"
            placeholderEmpty="API kalitni kiriting..."
            hint={
              form.api_key_is_set
                ? "Saqlangan kalit ko'rsatilmaydi. Yangi qiymat kiritilganda yangilanadi."
                : "API kalit hali saqlanmagan."
            }
          />
        )}

        {/* AWS Access Key ID — only for Bedrock */}
        {fields.aws_access_key_id && (
          <SecretField
            id="ai-aws-access-key-id"
            label="AWS Access Key ID"
            configKey="ai_agent.aws_access_key_id"
            draft={form.aws_access_key_id_draft}
            isSet={form.aws_access_key_id_is_set}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, aws_access_key_id_draft: val }))
            }
            placeholderSet="•••••• (saqlangan — o'zgartirish uchun yangi key kiriting)"
            placeholderEmpty="AKIA... kiriting"
            hint={
              form.aws_access_key_id_is_set
                ? "Saqlangan kalit ko'rsatilmaydi. Yangi qiymat kiritilganda yangilanadi."
                : "AWS Access Key ID hali saqlanmagan."
            }
          />
        )}

        {/* AWS Secret Access Key — only for Bedrock */}
        {fields.aws_secret_access_key && (
          <SecretField
            id="ai-aws-secret-access-key"
            label="AWS Secret Access Key"
            configKey="ai_agent.aws_secret_access_key"
            draft={form.aws_secret_access_key_draft}
            isSet={form.aws_secret_access_key_is_set}
            onChange={(val) =>
              setForm((prev) => ({
                ...prev,
                aws_secret_access_key_draft: val,
              }))
            }
            placeholderSet="•••••• (saqlangan — o'zgartirish uchun yangi key kiriting)"
            placeholderEmpty="Secret access key kiriting"
            hint={
              form.aws_secret_access_key_is_set
                ? "Saqlangan kalit ko'rsatilmaydi. Yangi qiymat kiritilganda yangilanadi."
                : "AWS Secret Access Key hali saqlanmagan."
            }
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving || !hasChanged()}>
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
