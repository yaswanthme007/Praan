"use client";
import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { RiskMeter } from "@/components/widgets/RiskMeter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Sparkline } from "@/components/widgets/Sparkline";
import { sensors as SENSORS, workers as WORKERS, zones, permits, maintenance, initialAlerts, kpis, riskHistory24h } from "@/lib/mock";
import { severityHex } from "@/lib/utils";
import { TimeString } from "@/components/ui/RelTime";
import { motion } from "framer-motion";
import { Activity, Radio, Users, Wrench, ClipboardCheck } from "lucide-react";

export default function LiveMonitoringPage() {
  const [tick, setTick] = useState(0);
  const [risk, setRisk] = useState(kpis.compoundRisk);
  const [sensorState, setSensorState] = useState(SENSORS);

  useEffect(() => {
    const t = setInterval(() => {
      setTick((x) => x + 1);
      setRisk((r) => Math.max(0, Math.min(100, r + (Math.random() - 0.5) * 3)));
      setSensorState((prev) =>
        prev.map((s) => {
          const drift = (Math.random() - 0.5) * (s.threshold.crit / 40);
          const val = Number(Math.max(0, s.value + drift).toFixed(1));
          const status =
            (s.type === "OXYGEN" ? val < s.threshold.crit : val > s.threshold.crit) ? "critical" :
            (s.type === "OXYGEN" ? val < s.threshold.warn : val > s.threshold.warn) ? "elevated" :
            "safe";
          const history = [...s.history.slice(1), val];
          return { ...s, value: val, status: status as any, history };
        })
      );
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-[1700px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">Live Monitoring</h1>
          <p className="mt-1 text-sm text-ink-mid">Real-time telemetry wall — {SENSORS.length} sensors · updates every 1.5s.</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-ink-mid">
          <StatusBadge severity="safe" pulse label="Streaming" />
          <span>update #{tick}</span>
        </div>
      </div>

      {/* Top command row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex items-center justify-center border border-line bg-bg-s1/70 p-4 lg:col-span-3">
          <RiskMeter score={risk} size={220} label="Live Compound" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:col-span-6 md:grid-cols-4">
          <LiveTile label="Plants" value="1/5" tone="cyan" icon={<Activity size={13} />} />
          <LiveTile label="Zones Alive" value={`${zones.length}`} tone="cyan" />
          <LiveTile label="Workers Active" value={`${WORKERS.filter((w) => w.status === "ACTIVE" || w.status === "EMERGENCY").length}`} tone="cyan" icon={<Users size={13} />} />
          <LiveTile label="Permits Active" value={`${permits.filter((p) => p.status === "ACTIVE").length}`} tone="elevated" icon={<ClipboardCheck size={13} />} />
          <LiveTile label="Maintenance" value={`${maintenance.filter((m) => m.status === "IN PROGRESS").length}`} tone="cyan" icon={<Wrench size={13} />} />
          <LiveTile label="Sensors Crit" value={`${sensorState.filter(s => s.status === "critical").length}`} tone="critical" />
          <LiveTile label="Sensors Warn" value={`${sensorState.filter(s => s.status === "elevated").length}`} tone="elevated" />
          <LiveTile label="Emergencies" value={`${WORKERS.filter(w => w.status === "EMERGENCY").length}`} tone="critical" icon={<Radio size={13} />} />
        </div>
        <div className="lg:col-span-3">
          <Panel title="Live Timeline" dense>
            <ul className="space-y-1.5 max-h-[230px] overflow-y-auto">
              {initialAlerts.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-xs">
                  <span className="mt-1 font-mono text-[10px] text-ink-lo"><TimeString ts={a.ts} /></span>
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                    a.severity === "critical" ? "bg-sev-critical animate-pulseDot" :
                    a.severity === "elevated" ? "bg-sev-elevated" : "bg-sev-watch"
                  }`} />
                  <span className="text-ink-hi">{a.title}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Sensor wall */}
      <Panel title="Sensor Feed · Live" subtitle={`${sensorState.length} channels · every 1500ms`}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {sensorState.map((s) => {
            const color = severityHex(s.status);
            const zone = zones.find(z => z.id === s.zoneId);
            return (
              <motion.div
                key={s.id}
                data-testid={`live-sensor-${s.code}`}
                layout
                className="group relative border border-line/70 bg-bg-s2/40 p-2.5 hover:border-line-strong"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-ink-lo">{zone?.code}</span>
                  <span className="text-ink-mid">{s.code}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono text-xl font-bold tabular-nums" style={{ color }}>
                    {s.value}
                  </span>
                  <span className="font-mono text-[10px] text-ink-lo">{s.unit}</span>
                </div>
                <div className="-mx-1 mt-1">
                  <Sparkline data={s.history.slice(-24)} color={color} width={140} height={26} />
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[9px] text-ink-lo">
                  <span>{s.type}</span>
                  <StatusBadge severity={s.status} className="scale-75 origin-right" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function LiveTile({ label, value, tone = "cyan", icon }: any) {
  const map: any = { cyan: "text-accent-cyan", critical: "text-sev-critical", elevated: "text-sev-elevated", safe: "text-sev-safe" };
  return (
    <div className="border border-line bg-bg-s1/70 p-3">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">
        <span>{label}</span>{icon}
      </div>
      <div className={`mt-1 font-mono text-2xl font-bold tabular-nums ${map[tone]}`}>{value}</div>
    </div>
  );
}
