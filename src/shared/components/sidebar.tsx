"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  LayoutTemplate,
  CheckSquare,
  Wallet,
  Banknote,
  ArrowLeftRight,
  CreditCard,
  Ticket,
  ScrollText,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Megaphone,
  Settings2,
  Newspaper,
  Puzzle,
  KeyRound,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  {
    label: "Boshqaruv paneli",
    href: "/",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Foydalanuvchilar",
    href: "/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Loyihalar",
    href: "/projects",
    icon: <FolderOpen className="h-4 w-4" />,
  },
  {
    label: "Shablonlar",
    icon: <LayoutTemplate className="h-4 w-4" />,
    children: [
      { label: "Barcha shablonlar", href: "/templates" },
      { label: "Tasdiqlash", href: "/templates/submissions" },
    ],
  },
  {
    label: "Yechib olishlar",
    href: "/withdrawals",
    icon: <Wallet className="h-4 w-4" />,
  },
  {
    label: "Bot yechishlari",
    href: "/bot-withdrawals",
    icon: <Banknote className="h-4 w-4" />,
  },
  {
    label: "Verifikatsiyalar",
    href: "/kyc",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    label: "Tranzaksiyalar",
    href: "/transactions",
    icon: <ArrowLeftRight className="h-4 w-4" />,
  },
  {
    label: "Tariflar",
    href: "/plans",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    label: "Modullar",
    href: "/modules",
    icon: <Puzzle className="h-4 w-4" />,
  },
  {
    label: "Credential turlari",
    href: "/credential-types",
    icon: <KeyRound className="h-4 w-4" />,
  },
  {
    label: "Broadcast",
    href: "/broadcast",
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    label: "Ticketlar",
    href: "/tickets",
    icon: <Ticket className="h-4 w-4" />,
  },
  {
    label: "Blog",
    href: "/blog",
    icon: <Newspaper className="h-4 w-4" />,
  },
  {
    label: "Audit log",
    href: "/audit-log",
    icon: <ScrollText className="h-4 w-4" />,
  },
  {
    label: "Sozlamalar",
    icon: <Settings2 className="h-4 w-4" />,
    children: [
      { label: "Umumiy sozlamalar", href: "/settings/general" },
      { label: "AI Agent", href: "/settings/ai" },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
  });

  if (item.children) {
    const isChildActive = item.children.some(
      (c) => pathname === c.href || pathname.startsWith(c.href + "/")
    );
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isChildActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-1 border-l border-sidebar-border pl-3">
            {item.children.map((child) => {
              const active = pathname === child.href || pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "text-sidebar-primary font-medium"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const active = item.href
    ? item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/")
    : false;

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
        <span className="font-semibold text-sidebar-foreground">BotSpace Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
        {NAV.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
}
