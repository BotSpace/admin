import { AdminAPI } from "@/shared/api/services";
import { AiConfigForm } from "@/features/settings/ai-config-form";

export const metadata = { title: "AI Sozlamalari | BotSpace Admin" };

export default async function AiSettingsPage() {
  let configs;
  try {
    configs = await AdminAPI.aiAgentSettings();
  } catch {
    configs = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Sozlamalari</h1>
        <p className="text-muted-foreground text-sm">
          Platforma AI agentining global konfiguratsiyasi
        </p>
      </div>

      {configs === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive max-w-2xl">
          Sozlamalarni yuklashda xatolik. API mavjudligini tekshiring.
        </div>
      ) : (
        <AiConfigForm configs={configs} />
      )}
    </div>
  );
}
