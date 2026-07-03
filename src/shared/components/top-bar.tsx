"use client";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { env } from "@/shared/lib/env";
import { logoutAction } from "@/app/login/actions";

type Props = {
  userName?: string;
};

export function TopBar({ userName }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div />
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Tema almashtirish"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        {userName && (
          <span className="text-sm text-muted-foreground">{userName}</span>
        )}
        <a
          href={`${env.NEXT_PUBLIC_DASHBOARD_URL}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard &rarr;
        </a>
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Chiqish">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
