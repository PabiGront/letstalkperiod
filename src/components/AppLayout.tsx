import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Search,
  FolderOpen,
  Settings,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meeting-summariser", label: "Meeting Summariser", icon: FileText },
  { to: "/email-generator", label: "Email Generator", icon: Mail },
  { to: "/research-assistant", label: "Research Assistant", icon: Search },
  { to: "/saved-work", label: "Saved Work", icon: FolderOpen },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AiDisclaimer({ extra }: { extra?: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-muted/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p>
        AI-generated content may contain errors or omissions. Review and verify important
        information before using or sharing it. This tool assists with workplace productivity and
        does not replace professional judgement.
        {extra ? ` ${extra}` : null}
      </p>
    </div>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
      <span className="bg-gradient-primary flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-primary-foreground">
        LT
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Let&apos;s Talk. Period!</span>
        <span className="block text-xs text-muted-foreground">Work Assistant</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        {brand}
        <div className="mt-8 flex-1">{nav}</div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          AI assists — you decide. Always review generated content.
        </p>
      </aside>

      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        {brand}
        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-border p-2 text-foreground"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open ? (
        <div className="border-b border-border bg-sidebar px-4 py-3 lg:hidden">{nav}</div>
      ) : null}

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
          {children}
          <AiDisclaimer />
        </div>
      </main>
    </div>
  );
}