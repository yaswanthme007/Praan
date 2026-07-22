"use client";
import { PlantMap } from "@/components/widgets/PlantMap";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { zones, permits, workers, maintenance } from "@/lib/mock";
import { useState } from "react";
import { severityColor } from "@/lib/utils";

export default function PlantMapPage() {
  const [time, setTime] = useState(100);
  return (
    <div className="mx-auto max-w-[1700px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">Digital Plant Map</h1>
          <p className="mt-1 text-sm text-ink-mid">
            Interactive floor-plan · risk heatmap · sensors · workers · permits · maintenance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge severity="critical" pulse label="Live · Reactor Bay A" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <PlantMap hero />
          <div className="mt-3 border border-line bg-bg-s1/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-lo">Timeline Scrubber · T-{Math.round(100 - time)}m</div>
              <span className="font-mono text-[10px] text-ink-mid">Drag to replay heat evolution</span>
            </div>
            <input
              data-testid="timeline-slider"
              type="range"
              min={0}
              max={100}
              value={time}
              onChange={(e) => setTime(+e.target.value)}
              className="mt-2 w-full accent-accent-cyan"
            />
          </div>
        </div>
        <div className="space-y-3 lg:col-span-3">
          <Panel title="Zone Roster">
            <ul className="space-y-1.5">
              {zones.map((z) => {
                const sev = severityColor(z.risk);
                return (
                  <li key={z.id} className="flex items-center justify-between border-b border-line/40 pb-1.5 last:border-0">
                    <div>
                      <div className="text-xs text-ink-hi">{z.name}</div>
                      <div className="font-mono text-[10px] text-ink-lo">{z.code}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-ink-hi tabular-nums">{z.risk}</span>
                      <StatusBadge severity={sev as any} className="scale-75 origin-right" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <Panel title="Overlay Counts" dense>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <MiniStat label="Active Permits" value={permits.filter(p => p.status === "ACTIVE").length} />
              <MiniStat label="Workers On Site" value={workers.filter(w => w.status === "ACTIVE" || w.status === "EMERGENCY").length} />
              <MiniStat label="Maintenance" value={maintenance.filter(m => m.status === "IN PROGRESS").length} />
              <MiniStat label="Emergencies" value={workers.filter(w => w.status === "EMERGENCY").length} tone="critical" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
function MiniStat({ label, value, tone }: { label: string; value: any; tone?: string }) {
  return (
    <div className="border border-line/60 bg-bg-s2/40 p-2">
      <div className="text-[9px] uppercase tracking-[0.18em] text-ink-lo">{label}</div>
      <div className={`text-lg ${tone === "critical" ? "text-sev-critical" : "text-ink-hi"}`}>{value}</div>
    </div>
  );
}
