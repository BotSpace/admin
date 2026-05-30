import { AdminAPI, type AdminProject } from "@/shared/api/services";
import { BroadcastForm } from "@/features/broadcast/broadcast-form";

export const metadata = { title: "Broadcast | BotSpace Admin" };

export default async function BroadcastPage() {
  let projects: AdminProject[];
  try {
    const page1 = await AdminAPI.projects({ is_template: "false", ordering: "name" });
    projects = page1.results;
  } catch {
    projects = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Broadcast</h1>
        <p className="text-muted-foreground text-sm">
          Loyiha foydalanuvchilariga Telegram xabar yuborish
        </p>
      </div>

      <BroadcastForm projects={projects} />
    </div>
  );
}
