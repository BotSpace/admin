import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "BotSpace Admin",
  description: "BotSpace boshqaruv paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
