"use client";
import { RiskMeter } from "@/components/widgets/RiskMeter";
import { Panel } from "@/components/ui/Panel";
import { RiskTrendChart } from "@/components/widgets/RiskTrendChart";
import { CompoundRulesActive } from "@/components/widgets/CompoundRulesActive";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { kpis, compoundRules } from "@/lib/mock";
import { Sparkles, Zap, TrendingUp, Clock, CheckCircle2, ChevronRight } from "lucide-react";

const factors = [
  { name: "Gas rise rate", weight: 32, delta: "+11 last 15m", tone: "critical" },
  { name: "Hot Work in Zone Z-01", weight: 24, delta: "PTW-2041 active", tone: "critical" },
  { name: "Worker density inside Reactor Bay A", weight: 14, delta: "4 workers", tone: "elevated" },
  { name: "Wind vector toward zone", weight: 10, delta: "42 km/h SW→NE", tone: "elevated" },
  { name: "Maintenance running · Cooling loop", weight: 8, delta: "62% complete", tone: "watch" },
  { name: "Historical incident affinity", weight: 6, delta: "Similar to INC-2024-089", tone: "watch" },
  { name: "Ambient temperature", weight: 4, delta: "34°C", tone: "safe" },
  { name: "Calibration drift · GA-119", weight: 2, delta: "46d overdue", tone: "safe" },
];
const toneColors: Record<string, string> = {
  critical: "bg-sev-critical", elevated: "bg-sev-elevated", watch: "bg-sev-watch", safe: "bg-sev-safe",
};

const actions = [
  "Halt Hot Work permit PTW-2041 for 15 minutes and vent zone.",
  "Evacuate non-essential workers from Reactor Bay A to muster point M-2.",
  "Confirm cooling loop return flow ≥ 260 m³/h before resuming.",
  "Cross-check gas sensors GA-101 & GA-108 with portable meter.",
];

export default function RiskCenterPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl">Compound Risk Center</h1>
        <p className="mt-1 text-sm text-ink-mid">
          The plant is safe by any single sensor. It is not safe by their combination.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative flex flex-col items-center justify-center border border-line bg-bg-s1/70 p-6 lg:col-span-4">
          <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-lo">
            Current Risk
          </div>
          <RiskMeter score={74} size={280} />
          <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center font-mono text-[11px]">
            <div className="border border-line/60 p-2">
              <div className="text-ink-lo text-[9px] uppercase tracking-[0.2em]">Lead Time</div>
              <div className="text-sev-critical text-lg">12m</div>
            </div>
            <div className="border border-line/60 p-2">
              <div className="text-ink-lo text-[9px] uppercase tracking-[0.2em]">Confidence</div>
              <div className="text-accent-cyan text-lg">89%</div>
            </div>
            <div className="border border-line/60 p-2">
              <div className="text-ink-lo text-[9px] uppercase tracking-[0.2em]">Rule</div>
              <div className="text-ink-hi text-sm">CR-014</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <Panel
            title="AI Explanation · PRAAN Reasoning"
            subtitle="Why the compound score exceeded critical"
            actions={<StatusBadge severity="critical" pulse />}
          >
            <div className="relative border-l-2 border-accent-cyan/40 pl-4">
              <div className="text-sm leading-relaxed text-ink-hi">
                Hydrocarbon sensor <span className="font-mono text-sev-elevated">GA-101</span> in
                <span className="font-mono text-ink-hi"> Z-01 · Reactor Bay A</span> is rising at
                <span className="font-mono text-sev-elevated"> 2.3 ppm/min</span>, still below its own alarm.
                Concurrently, <span className="font-mono text-ink-hi">PTW-2041 (Hot Work)</span> is active in
                the same zone with <span className="font-mono">4 workers present</span> and a maintenance
                cooling-loop task <span className="font-mono">WO-8801</span> partially blocking vent flow.
                Wind vector is <span className="font-mono">SW → NE</span> at 42 km/h — carrying vapor
                <span className="text-sev-critical"> toward the ignition point</span>. Historical similarity
                matches <span className="font-mono">INC-2024-089</span> which escalated in
                <span className="text-sev-critical"> 14 minutes</span>.
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {actions.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 border border-line/60 bg-bg-s2/40 p-3 text-sm text-ink-mid"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-accent-cyan/40 font-mono text-[10px] text-accent-cyan">
                    {i + 1}
                  </span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="critical" data-testid="risk-action-halt">Halt Hot Work</Button>
              <Button variant="danger" data-testid="risk-action-evacuate">Evacuate Zone</Button>
              <Button variant="secondary">Notify Response Team</Button>
              <Button variant="ghost">Snooze 5m</Button>
            </div>
          </Panel>
          <Panel title="Risk Contributors" subtitle="Weighted by AI model attribution">
            <ul className="space-y-2">
              {factors.map((f) => (
                <li key={f.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-hi">{f.name}</span>
                    <span className="font-mono text-ink-mid">{f.delta}</span>
                  </div>
                  <div className="mt-1 flex h-1.5 items-center gap-2">
                    <div className="relative h-full flex-1 bg-line/60">
                      <div
                        className={`absolute inset-y-0 left-0 ${toneColors[f.tone]}`}
                        style={{ width: `${f.weight * 2.5}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-ink-lo">{f.weight}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8"><RiskTrendChart title="Compound Risk · Historical" /></div>
        <div className="lg:col-span-4">
          <Panel title="Similar Cases · Precedent Search">
            <ul className="space-y-2 text-xs">
              {[
                ["INC-2024-089", "Reactor Bay A", "critical", "Escalated in 14m"],
                ["INC-2024-051", "Cracker Unit", "elevated", "De-escalated in 22m"],
                ["INC-2023-114", "Compressor Hall", "critical", "Escalated in 9m"],
                ["INC-2023-078", "Reactor Bay A", "elevated", "De-escalated in 38m"],
              ].map(([code, zone, sev, out]) => (
                <li key={code} className="group flex items-center justify-between border border-line/60 bg-bg-s2/40 p-2 hover:border-line-strong">
                  <div>
                    <div className="font-mono text-[11px] text-ink-hi">{code}</div>
                    <div className="text-[10px] text-ink-lo">{zone}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge severity={sev as any} className="scale-90" />
                    <div className="mt-1 text-[10px] text-ink-mid">{out}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <CompoundRulesActive />
    </div>
  );
}
