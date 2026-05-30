import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminAPI } from "@/shared/api/services";
import { readSession } from "@/shared/auth/session";
import { Sidebar } from "@/shared/components/sidebar";
import { TopBar } from "@/shared/components/top-bar";
import { env } from "@/shared/lib/env";
import { ShieldOff } from "lucide-react";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  if (!session) {
    redirect(`${env.NEXT_PUBLIC_DASHBOARD_URL}/login`);
  }

  let me;
  try {
    me = await AdminAPI.me();
  } catch {
    // API unreachable or 401 — treat as no access
    me = null;
  }

  if (!me || (!me.is_staff && !me.is_superuser)) {
    const dashboardUrl = env.NEXT_PUBLIC_DASHBOARD_URL;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Ruxsat yo&apos;q</h1>
            <p className="text-muted-foreground text-sm">
              Sizda admin huquqlari yo&apos;q. Bu sahifaga kirish uchun
              administrator tomonidan ruxsat berilishi kerak.
            </p>
          </div>
          <Link
            href={dashboardUrl}
            className="text-sm text-primary hover:underline"
          >
            &larr; Dashboard-ga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const userName = [me.first_name, me.last_name].filter(Boolean).join(" ") || me.phone;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar userName={userName} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
