import { AdminAPI } from "@/shared/api/services";
import { GeneralSettingsForm } from "@/features/general-settings/general-settings-form";

export const metadata = { title: "Umumiy sozlamalar | BotSpace Admin" };

export default async function GeneralSettingsPage() {
  let settings;
  try {
    settings = await AdminAPI.generalSettings();
  } catch {
    settings = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Umumiy sozlamalar</h1>
        <p className="text-muted-foreground text-sm">
          Platforma darajasidagi umumiy parametrlar — sayt nomi, aloqa va komissiya
        </p>
      </div>

      {settings === null ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive max-w-2xl">
          Sozlamalarni yuklashda xatolik. API mavjudligini tekshiring.
        </div>
      ) : (
        <GeneralSettingsForm settings={settings} />
      )}
    </div>
  );
}
