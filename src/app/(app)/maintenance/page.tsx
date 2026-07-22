"use client";
import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { maintenance, zones } from "@/lib/mock";
import { Wrench, Clock, ChevronRight } from "lucide-react";

const tabs = ["ACTIVE", "SCHEDULED", "COMPLETED", "OVERDUE", "ALL"] as const;

export default function MaintenancePage() {
  const [tab, setTab] = useState<typeof tabs[number]>("ACTIVE");
  const filtered = maintenance.filter((m) => {
    if (tab === "ALL") return true;
    if (tab === "ACTIVE") return m.status === "IN PROGRESS";
    return m.status === tab;
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl">Maintenance</h1>
        <p className="mt-1 text-sm text-ink-mid">Work orders, equipment status, and safety-adjacent tasks.</p>
      </div>

      <div className="flex items-center gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-testid={`maint-tab-${t}`}
            className={`h-9 px-3 font-mono text-[11px] uppercase tracking-[0.2em] ${
              tab === t ? "border-b-2 border-accent-cyan text-ink-hi" : "text-ink-lo hover:text-ink-hi"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((m) => {
          const sev = m.status === "OVERDUE" ? "critical" : m.status === "IN PROGRESS" ? "elevated" : m.status === "COMPLETED" ? "safe" : "watch";
          return (
            <div key={m.id} className="grid grid-cols-1 gap-3 border border-line bg-bg-s1/70 p-4 md:grid-cols-12">
              <div className="md:col-span-5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-lo">{m.code}</span>
                  <StatusBadge severity={sev as any} />
                </div>
                <div className="mt-1 text-sm text-ink-hi">{m.equipment}</div>
                <div className="mt-0.5 font-mono text-[10px] text-ink-lo">
                  {zones.find(z => z.id === m.zoneId)?.name} · {m.team}
                </div>
              </div>
              <div className="md:col-span-5">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-ink-lo">
                  <span>Progress</span>
                  <span className="text-ink-mid">{m.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-line/60">
                  <div className={`h-full ${
                    m.status === "OVERDUE" ? "bg-sev-critical" : m.status === "IN PROGRESS" ? "bg-accent-cyan" : m.status === "COMPLETED" ? "bg-sev-safe" : "bg-sev-watch"
                  }`} style={{ width: `${m.progress}%` }} />
                </div>
                <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-ink-mid">
                  <Clock size={10}/><span>ETA {m.eta}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 md:col-span-2">
                <Button variant="ghost" size="xs">View <ChevronRight size={12}/></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
