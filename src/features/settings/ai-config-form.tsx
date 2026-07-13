"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, RotateCcw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
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
import { type AiAgentSettings } from "@/shared/api/services";
import { updateAiSettingsAction } from "./actions";

// Provider values map 1:1 to the agent's build_effective_client() branches
// (ai_agent.provider). DeepSeek is OpenAI-compatible (base_url api.deepseek.com);
// use model ids deepseek-v4-flash / deepseek-v4-pro.
const PROVIDER_OPTIONS = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "gemini", label: "Google Gemini" },
  { value: "ollama", label: "Ollama" },
  { value: "bedrock", label: "AWS Bedrock" },
] as const;

type Props = {
  configs: AiAgentSettings;
};

export function AiConfigForm({ configs }: Props) {
  const [form, setForm] = useState<AiAgentSettings>(configs);
  const [showKey, setShowKey] = useState(false);
  const [saving, startSave] = useTransition();

  const isDirty = JSON.stringify(form) !== JSON.stringify(configs);

  function handleReset() {
    setForm(configs);
  }

  function handleSave() {
    if (!isDirty) {
      toast.info("O'zgartirishlar yo'q");
      return;
    }
    startSave(async () => {
      const result = await updateAiSettingsAction(form);
      if (result.ok) {
        toast.success("AI sozlamalari saqlandi");
        setForm(result.data);
      } else {
        toast.error("Saqlashda xatolik", { description: result.message });
      }
    });
  }

  const providerLabel = PROVIDER_OPTIONS.find((p) => p.value === form.provider)?.label ?? form.provider;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>AI Agent sozlamalari</CardTitle>
        <CardDescription>
          Platforma AI agentining LLM provayder, model va parametrlari. O&apos;zgarishlar darhol kuchga
          kiradi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ai-provider">
              Provayder
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">provider</span>
            </Label>
            <Select
              value={form.provider}
              onValueChange={(v) => setForm((p) => ({ ...p, provider: v }))}
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ai-model">
              Model ID
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">model</span>
            </Label>
            <Input
              id="ai-model"
              value={form.model}
              onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
              placeholder="masalan: claude-sonnet-4-5"
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ai-api-key">
            API kalit
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">api_key</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="ai-api-key"
              type={showKey ? "text" : "password"}
              value={form.api_key}
              onChange={(e) => setForm((p) => ({ ...p, api_key: e.target.value }))}
              placeholder="API kalitni kiriting..."
              autoComplete="new-password"
              className="font-mono text-sm"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setShowKey((v) => !v)}>
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ai-max-tokens">
              Max tokens
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">max_tokens</span>
            </Label>
            <Input
              id="ai-max-tokens"
              type="number"
              min={1}
              value={form.max_tokens}
              onChange={(e) => setForm((p) => ({ ...p, max_tokens: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ai-temperature">
              Temperature
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">temperature</span>
            </Label>
            <Input
              id="ai-temperature"
              type="number"
              min={0}
              max={2}
              step="0.1"
              value={form.temperature}
              onChange={(e) => setForm((p) => ({ ...p, temperature: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ai-system-prompt">
            Tizim prompt override
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">system_prompt_override</span>
          </Label>
          <Textarea
            id="ai-system-prompt"
            value={form.system_prompt_override}
            onChange={(e) => setForm((p) => ({ ...p, system_prompt_override: e.target.value }))}
            placeholder="Bo'sh qoldirilsa standart tizim prompt ishlatiladi"
            rows={5}
            className="font-mono text-sm"
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
