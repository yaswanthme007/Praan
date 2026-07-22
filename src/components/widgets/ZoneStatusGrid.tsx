"use client";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { zones } from "@/lib/mock";

export function ZoneStatusGrid({ compact = false }: { compact?: boolean }) {
  return (
    <Panel title="Zone Status" subtitle={`${zones.length} zones · IN-JMN-01`}>
      <div className={compact ? "grid grid-cols-2 gap-2 md:grid-cols-3" : "grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5"}>
        {zones.map((z) => {
          const sev = z.risk >= 75 ? "critical" : z.risk >= 55 ? "elevated" : z.risk >= 30 ? "watch" : "safe";
          return (
            <div key={z.id} className="group border border-line/70 bg-bg-s2/40 p-2.5 hover:border-line-strong">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">
                  {z.code}
                </span>
                <StatusBadge severity={sev as any} pulse={sev === "critical"} className="scale-90" />
              </div>
              <div className="mt-1 truncate text-xs text-ink-hi">{z.name}</div>
              <div className="mt-2 flex items-end justify-between">
                <span className="font-mono text-xl font-bold text-ink-hi">
                  {z.risk}
                </span>
                <span className="font-mono text-[10px] text-ink-mid">
                  {z.workers} worker{z.workers === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-1 h-1 w-full bg-line/60">
                <div
                  className={`h-full ${sev === "critical" ? "bg-sev-critical" : sev === "elevated" ? "bg-sev-elevated" : sev === "watch" ? "bg-sev-watch" : "bg-sev-safe"}`}
                  style={{ width: `${z.risk}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
