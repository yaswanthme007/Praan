"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Command, Search, User, Wifi } from "lucide-react";
import { LiveClock } from "@/components/ui/LiveClock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { NotificationDrawer } from "@/components/shell/NotificationDrawer";
import { cn } from "@/lib/utils";

const crumbMap: Record<string, string> = {
  "": "Executive Overview",
  live: "Live Monitoring",
  plants: "Plants",
  map: "Digital Plant Map",
  risk: "Compound Risk Center",
  alerts: "Alert Center",
  incidents: "Incident Center",
  replay: "Incident Replay",
  emergency: "Emergency Command",
  sensors: "Sensors",
  workers: "Workers",
  maintenance: "Maintenance",
  permits: "Permit-to-Work",
  reports: "Reports",
  rules: "Rule Library",
  ai: "AI Insights",
  notifications: "Notifications",
  settings: "System Settings",
  users: "User Management",
  audit: "Audit Logs",
  help: "Help",
  login: "Sign In",
};

export function Topbar() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header
        data-testid="app-topbar"
        className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg-base/85 px-4 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono uppercase tracking-[0.28em] text-ink-lo">
            IN-JMN-01
          </span>
          <span className="text-ink-dim">/</span>
          <span className="font-mono uppercase tracking-[0.28em] text-ink-mid">
            {parts[0] ? crumbMap[parts[0]] ?? parts[0].toUpperCase() : crumbMap[""]}
          </span>
          {parts[1] && (
            <>
              <span className="text-ink-dim">/</span>
              <span className="font-mono uppercase tracking-[0.28em] text-ink-hi">
                {parts[1].replace(/-/g, " ")}
              </span>
            </>
          )}
        </div>

        <div className="flex-1" />

        <button
          data-testid="global-search-trigger"
          onClick={() => setPaletteOpen(true)}
          className={cn(
            "hidden md:flex h-9 min-w-[280px] items-center gap-3 border border-line bg-bg-s1 px-3 text-xs text-ink-lo transition-colors",
            "hover:border-line-strong hover:text-ink-mid"
          )}
        >
          <Search size={14} />
          <span>Search zones, sensors, incidents…</span>
          <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-ink-dim">
            <kbd className="border border-line px-1 py-0.5">⌘</kbd>
            <kbd className="border border-line px-1 py-0.5">K</kbd>
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-3 border-l border-line pl-3">
          <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-sev-safe">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-sev-safe animate-ping opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-sev-safe" />
            </span>
            Live
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-ink-mid">
            <Wifi size={12} /> 812/812
          </span>
          <LiveClock />
        </div>

        <button
          data-testid="notification-bell"
          onClick={() => setNotifOpen(true)}
          className="relative flex h-9 w-9 items-center justify-center border border-line text-ink-mid hover:text-ink-hi hover:border-line-strong"
        >
          <Bell size={14} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-sev-critical animate-pulseDot" />
        </button>

        <Link
          href="/settings"
          data-testid="profile-link"
          className="flex h-9 items-center gap-2 border border-line px-2 hover:border-line-strong"
        >
          <div className="flex h-6 w-6 items-center justify-center bg-accent-cyan/20 text-accent-cyan text-[10px] font-mono font-bold">
            PK
          </div>
          <span className="hidden sm:block text-xs text-ink-mid">Priya · Safety Ofc.</span>
        </Link>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <NotificationDrawer open={notifOpen} onOpenChange={setNotifOpen} />
    </>
  );
}
