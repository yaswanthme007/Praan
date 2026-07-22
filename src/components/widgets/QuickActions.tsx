"use client";
import { Panel } from "@/components/ui/Panel";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, Map, Radio, Rewind, Sparkles } from "lucide-react";

const actions = [
  { href: "/emergency", label: "Trigger Evacuation Drill", icon: Radio, tone: "critical" },
  { href: "/alerts", label: "Acknowledge Alerts", icon: AlertTriangle, tone: "elevated" },
  { href: "/permits", label: "Open Permit-to-Work", icon: ClipboardCheck, tone: "cyan" },
  { href: "/map", label: "Open Plant Map", icon: Map, tone: "cyan" },
  { href: "/replay", label: "Replay Last Incident", icon: Rewind, tone: "cyan" },
  { href: "/ai", label: "Ask PRAAN AI", icon: Sparkles, tone: "cyan" },
];

const toneMap: Record<string, string> = {
  critical: "border-sev-critical/40 text-sev-critical hover:bg-sev-critical/10",
  elevated: "border-sev-elevated/40 text-sev-elevated hover:bg-sev-elevated/10",
  cyan: "border-line text-ink-mid hover:border-accent-cyan hover:text-accent-cyan hover:bg-bg-s2",
};

export function QuickActions() {
  return (
    <Panel title="Quick Actions">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href + a.label}
              href={a.href}
              data-testid={`quick-action-${a.label.replace(/\s/g, "-").toLowerCase()}`}
              className={`group flex items-center gap-2 border p-2.5 text-xs transition-colors ${toneMap[a.tone]}`}
            >
              <Icon size={14} />
              <span className="flex-1 text-left">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}
