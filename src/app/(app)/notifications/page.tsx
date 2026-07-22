"use client";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { initialAlerts } from "@/lib/mock";
import { DateTimeString } from "@/components/ui/RelTime";
import { useState } from "react";

const tabs = ["ALL", "CRITICAL", "WARNINGS", "ANNOUNCEMENTS"] as const;

export default function NotificationsPage() {
  const [tab, setTab] = useState<typeof tabs[number]>("ALL");
  const items = [
    ...initialAlerts,
    { id: "an1", severity: "watch" as const, title: "Scheduled maintenance window this weekend", detail: "SCADA v4.2 will be applied Saturday 02:00-04:00 UTC.", ts: new Date(Date.now()-3600_000).toISOString(), ack: true, category: "SYSTEM" as const, zoneId: "z6" },
    { id: "an2", severity: "safe" as const, title: "Q4 safety audit passed with zero findings", detail: "Congratulations to the Jamnagar team.", ts: new Date(Date.now()-86400_000).toISOString(), ack: true, category: "SYSTEM" as const, zoneId: "z6" },
  ];
  const filtered = items.filter(i => tab === "ALL" ? true : tab === "CRITICAL" ? i.severity === "critical" : tab === "WARNINGS" ? (i.severity === "elevated" || i.severity === "watch") : (i.severity === "safe"));

  return (
    <div className="mx-auto max-w-[1200px] space-y-4">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl">Notifications</h1>
        <p className="mt-1 text-sm text-ink-mid">Everything routed to you — filter by severity or category.</p>
      </div>
      <div className="flex items-center gap-1 border-b border-line">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`h-9 px-3 font-mono text-[11px] uppercase tracking-[0.2em] ${tab === t ? "border-b-2 border-accent-cyan text-ink-hi" : "text-ink-lo hover:text-ink-hi"}`}>
            {t}
          </button>
        ))}
      </div>
      <Panel title="Inbox" subtitle={`${filtered.length} items`}>
        <ul className="-mx-4 -my-4 divide-y divide-line/60">
          {filtered.map(n => (
            <li key={n.id} className="p-4 hover:bg-bg-s2/50">
              <div className="flex items-center gap-2">
                <StatusBadge severity={n.severity} pulse={n.severity === "critical" && !n.ack} />
                <span className="font-mono text-[10px] text-ink-lo"><DateTimeString ts={n.ts} /></span>
                <span className="ml-auto font-mono text-[10px] text-ink-mid">{n.category}</span>
              </div>
              <div className="mt-1 text-sm text-ink-hi">{n.title}</div>
              <div className="mt-0.5 text-xs text-ink-mid">{n.detail}</div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
