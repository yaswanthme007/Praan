"use client";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { activityFeed } from "@/lib/mock";
import { useState } from "react";
import { DateTimeString } from "@/components/ui/RelTime";
import { ScrollText, Filter } from "lucide-react";

const rows = Array.from({ length: 60 }).map((_, i) => {
  const actors = ["Priya Kapoor", "Rohit Datta", "Sameer Joshi", "PRAAN AI", "SCADA Bridge", "System"];
  const actions = ["acknowledged", "opened", "closed", "escalated", "created", "modified", "predicted"];
  const targets = ["alert #A-104", "permit PTW-2044", "incident INC-2026-014", "rule CR-021", "user karan@praan.io", "sensor GA-101 calibration"];
  return {
    ts: new Date(Date.now() - i * 5 * 60_000).toISOString(),
    actor: actors[i % actors.length],
    action: actions[i % actions.length],
    target: targets[i % targets.length],
    ip: `10.79.${(i % 255)}.${(i * 3) % 255}`,
  };
});

export default function AuditPage() {
  const [q, setQ] = useState("");
  const filtered = rows.filter(r => q === "" || `${r.actor} ${r.action} ${r.target}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl flex items-center gap-2">
          <ScrollText/> Audit Logs
        </h1>
        <p className="mt-1 text-sm text-ink-mid">Immutable log of every state change · signed & timestamped.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 border border-line bg-bg-s1/70 px-2 py-1 min-w-[280px]">
          <Filter size={12} className="text-ink-lo"/>
          <input data-testid="audit-search" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Filter actor, action, target…" className="w-full bg-transparent text-sm focus:outline-none"/>
        </div>
        <Button variant="ghost" size="sm">Export CSV</Button>
      </div>

      <Panel title={`Log · ${filtered.length}`}>
        <div className="-mx-4 -my-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line/60 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Actor</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Target</th>
                <th className="px-4 py-2">Source IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 25).map((r, i) => (
                <tr key={i} className="border-b border-line/40 hover:bg-bg-s2/50">
                  <td className="px-4 py-2 font-mono text-[11px] text-ink-lo"><DateTimeString ts={r.ts} /></td>
                  <td className="px-4 py-2 text-ink-hi">{r.actor}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-accent-cyan">{r.action}</td>
                  <td className="px-4 py-2 text-ink-mid">{r.target}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-ink-lo">{r.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
