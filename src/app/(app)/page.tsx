"use client";
import { RiskMeter } from "@/components/widgets/RiskMeter";
import { KpiTile } from "@/components/widgets/KpiTile";
import { Panel } from "@/components/ui/Panel";
import { RiskTrendChart } from "@/components/widgets/RiskTrendChart";
import { ZoneStatusGrid } from "@/components/widgets/ZoneStatusGrid";
import { RecentAlerts } from "@/components/widgets/RecentAlerts";
import { ActivityFeed } from "@/components/widgets/ActivityFeed";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { SystemStatus } from "@/components/widgets/SystemStatus";
import { QuickActions } from "@/components/widgets/QuickActions";
import { CompoundRulesActive } from "@/components/widgets/CompoundRulesActive";
import { kpis, riskHistory24h } from "@/lib/mock";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertOctagon, ClipboardCheck, HardHat, Signal, Wrench } from "lucide-react";
import { LiveClock } from "@/components/ui/LiveClock";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function ExecutiveOverview() {
  const [risk, setRisk] = useState(kpis.compoundRisk);
  useEffect(() => {
    const t = setInterval(() => {
      setRisk((prev) => {
        const drift = (Math.random() - 0.45) * 2.5;
        return Math.max(0, Math.min(100, +(prev + drift).toFixed(1)));
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const sparkBase = riskHistory24h.slice(-24).map((r) => r.v);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-lo">
              Facility · IN-JMN-01 · Jamnagar Refinery Cluster
            </span>
            <StatusBadge severity="critical" pulse label="Compound Alert" />
          </div>
          <h1 className="mt-2 font-black uppercase tracking-tight text-3xl sm:text-4xl">
            Mission Control
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-mid">
            Live compound risk intelligence across sensors, permits, workers and
            maintenance. See dangerous combinations before they happen.
          </p>
        </div>
        <div className="flex items-center gap-4 border border-line px-4 py-2 font-mono text-[11px] text-ink-mid">
          <span>SHIFT · B</span>
          <span className="text-ink-lo">|</span>
          <LiveClock />
          <span className="text-ink-lo">|</span>
          <span className="text-sev-safe flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-sev-safe animate-pulseDot" /> LIVE
          </span>
        </div>
      </div>

      {/* Hero: Risk Meter + KPIs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative col-span-1 flex items-center justify-center border border-line bg-bg-s1/70 p-6 lg:col-span-4"
        >
          <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-lo">
            Live · Compound Risk
          </div>
          <RiskMeter score={risk} size={280} />
          <div className="absolute bottom-3 right-3 flex items-center gap-2 font-mono text-[10px] text-ink-lo">
            Predicted lead time <span className="text-sev-critical">~12m</span>
          </div>
        </motion.div>

        <div className="col-span-1 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-8">
          <KpiTile testid="kpi-open-incidents" label="Open Incidents" value={kpis.openIncidents} unit="active" tone="critical" delta="+1 last 1h" icon={<AlertOctagon size={14} />} spark={[3,3,2,3,4,4,4,5,5]} />
          <KpiTile testid="kpi-active-permits" label="Active Permits" value={kpis.activePermits} unit="PTW" tone="elevated" delta="4 hot work" icon={<ClipboardCheck size={14} />} spark={[2,3,3,4,4,4,5,5,4]} />
          <KpiTile testid="kpi-workers" label="Workers On-Site" value={kpis.workersOnSite} unit="active" tone="cyan" delta="Shift B" icon={<HardHat size={14} />} spark={[9,10,11,12,12,13,13,14,15]} />
          <KpiTile testid="kpi-maintenance" label="Maintenance Runs" value={kpis.activeMaint} unit="ongoing" tone="cyan" delta="1 overdue" icon={<Wrench size={14} />} spark={[2,2,3,3,3,3,3,3,3]} />
          <KpiTile testid="kpi-sensors" label="Sensors Online" value={`${kpis.sensorsOnline - kpis.sensorsCritical}`} unit={`/ ${kpis.sensorsOnline}`} tone="safe" delta={`${kpis.sensorsCritical} critical`} icon={<Signal size={14} />} spark={[40,41,41,42,42,42,42,42,42]} />
          <KpiTile testid="kpi-risk" label="Compound Risk" value={Math.round(risk)} unit="/100" tone="critical" delta="↑ 6 last 15m" icon={<Activity size={14} />} spark={sparkBase} />
        </div>
      </div>

      {/* Row 2: trend + rules */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RiskTrendChart />
        </div>
        <div className="lg:col-span-4">
          <CompoundRulesActive />
        </div>
      </div>

      {/* Row 3: zones */}
      <ZoneStatusGrid />

      {/* Row 4: alerts + activity + weather + system */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <RecentAlerts />
        </div>
        <div className="lg:col-span-4">
          <ActivityFeed />
        </div>
        <div className="space-y-4 lg:col-span-3">
          <WeatherWidget />
          <QuickActions />
        </div>
      </div>

      {/* Row 5: system status full width */}
      <SystemStatus />
    </div>
  );
}
