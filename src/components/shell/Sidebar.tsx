"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Activity, AlertOctagon, AlertTriangle, BarChart3, BookOpen, Boxes, Building2,
  ChevronRight, ClipboardCheck, ClipboardList, Cog, Command, FileText, HardHat,
  Layers, LifeBuoy, Map, Radar, Radio, Rewind, Search, ShieldAlert, Signal,
  Sparkles, Terminal, Users, Wrench, ScrollText, Bell,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: any; testid: string };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Observe",
    items: [
      { href: "/", label: "Executive Overview", icon: BarChart3, testid: "nav-dashboard" },
      { href: "/live", label: "Live Monitoring", icon: Radar, testid: "nav-live" },
      { href: "/plants", label: "Plants", icon: Building2, testid: "nav-plants" },
      { href: "/map", label: "Digital Plant Map", icon: Map, testid: "nav-map" },
    ],
  },
  {
    label: "Understand",
    items: [
      { href: "/risk", label: "Compound Risk Center", icon: ShieldAlert, testid: "nav-risk" },
      { href: "/ai", label: "AI Insights", icon: Sparkles, testid: "nav-ai" },
      { href: "/rules", label: "Rule Library", icon: BookOpen, testid: "nav-rules" },
      { href: "/replay", label: "Incident Replay", icon: Rewind, testid: "nav-replay" },
    ],
  },
  {
    label: "Decide",
    items: [
      { href: "/alerts", label: "Alert Center", icon: AlertTriangle, testid: "nav-alerts" },
      { href: "/incidents", label: "Incident Center", icon: AlertOctagon, testid: "nav-incidents" },
      { href: "/emergency", label: "Emergency Command", icon: Radio, testid: "nav-emergency" },
    ],
  },
  {
    label: "Act",
    items: [
      { href: "/sensors", label: "Sensors", icon: Signal, testid: "nav-sensors" },
      { href: "/workers", label: "Workers", icon: Users, testid: "nav-workers" },
      { href: "/maintenance", label: "Maintenance", icon: Wrench, testid: "nav-maintenance" },
      { href: "/permits", label: "Permit-to-Work", icon: ClipboardCheck, testid: "nav-permits" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/reports", label: "Reports", icon: FileText, testid: "nav-reports" },
      { href: "/notifications", label: "Notifications", icon: Bell, testid: "nav-notifications" },
      { href: "/audit", label: "Audit Logs", icon: ScrollText, testid: "nav-audit" },
      { href: "/users", label: "User Management", icon: HardHat, testid: "nav-users" },
      { href: "/settings", label: "Settings", icon: Cog, testid: "nav-settings" },
      { href: "/help", label: "Help", icon: LifeBuoy, testid: "nav-help" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      data-testid="app-sidebar"
      className="hidden md:flex md:w-[240px] lg:w-[260px] shrink-0 flex-col border-r border-line bg-bg-s1/50 backdrop-blur-sm"
    >
      <Link
        href="/"
        data-testid="brand-link"
        className="flex items-center gap-3 border-b border-line px-5 py-4 hover:bg-bg-s2/50 transition-colors"
      >
        <BrandMark />
        <div className="flex flex-col leading-none">
          <span className="text-lg font-black tracking-[0.25em] text-ink-hi">
            PRAAN
          </span>
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.32em] text-ink-lo">
            Safety Intelligence
          </span>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto py-3">
        {groups.map((g) => (
          <div key={g.label} className="mb-3">
            <div className="px-5 pb-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-lo">
              {g.label}
            </div>
            <ul>
              {g.items.map((it) => {
                const active =
                  it.href === "/"
                    ? pathname === "/"
                    : pathname === it.href || pathname.startsWith(it.href + "/");
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      data-testid={it.testid}
                      className={cn(
                        "group relative flex items-center gap-3 px-5 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-bg-s2 text-ink-hi"
                          : "text-ink-mid hover:bg-bg-s2/60 hover:text-ink-hi"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 h-full w-[2px] bg-accent-cyan" />
                      )}
                      <Icon size={15} strokeWidth={1.6} />
                      <span className="flex-1">{it.label}</span>
                      {active && (
                        <ChevronRight size={12} className="text-accent-cyan" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-4 py-3">
        <div className="flex items-center justify-between text-2xs font-mono uppercase tracking-[0.2em] text-ink-lo">
          <span>Build 2026.01</span>
          <span className="flex items-center gap-1.5 text-sev-safe">
            <span className="h-1.5 w-1.5 rounded-full bg-sev-safe animate-pulseDot" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
      <defs>
        <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#FFAB00" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" fill="none" stroke="url(#pg)" strokeWidth="1.5" />
      <path d="M6 24 L6 8 L16 8 L21 12 L16 16 L11 16 L11 24 Z" fill="none" stroke="#F4F4F5" strokeWidth="1.6" />
      <circle cx="24" cy="22" r="2.5" fill="#FF3B30" />
      <circle cx="24" cy="22" r="4.5" fill="none" stroke="#FF3B30" strokeOpacity="0.4" />
    </svg>
  );
}
