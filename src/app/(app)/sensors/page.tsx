"use client";
import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Sparkline } from "@/components/widgets/Sparkline";
import { sensors as SENSORS, zones } from "@/lib/mock";
import { severityHex } from "@/lib/utils";
import { Search } from "lucide-react";

const types = ["ALL", "GAS", "TEMP", "PRESSURE", "FLOW", "VIBRATION", "SMOKE", "OXYGEN"] as const;

export default function SensorsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<typeof types[number]>("ALL");
  const [sel, setSel] = useState(SENSORS[0]);

  const filtered = SENSORS.filter(
    (s) =>
      (type === "ALL" || s.type === type) &&
      (q === "" || `${s.code} ${s.name} ${zones.find((z) => z.id === s.zoneId)?.name}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-[1700px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">Sensors</h1>
          <p className="mt-1 text-sm text-ink-mid">{SENSORS.length} channels · gas · temperature · pressure · flow · vibration · smoke · oxygen</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border border-line bg-bg-s1/70 p-2">
        <div className="flex items-center gap-2 border border-line bg-bg-base px-2 py-1 flex-1 min-w-[240px]">
          <Search size={14} className="text-ink-lo" />
          <input
            data-testid="sensor-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by code, zone, name…"
            className="w-full bg-transparent text-sm text-ink-hi placeholder:text-ink-lo focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {types.map((t) => (
            <button
              key={t}
              data-testid={`sensor-type-${t}`}
              onClick={() => setType(t)}
              className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
                type === t ? "border-accent-cyan text-accent-cyan bg-bg-s2" : "border-line text-ink-mid hover:text-ink-hi"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Panel title={`Sensor Registry · ${filtered.length}`}>
            <div className="-mx-4 -my-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line/60 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2">Zone</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2 text-right">Value</th>
                    <th className="px-4 py-2 text-right">Warn / Crit</th>
                    <th className="px-4 py-2">Trend 24h</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSel(s)}
                      data-testid={`sensor-row-${s.code}`}
                      className={`cursor-pointer border-b border-line/40 hover:bg-bg-s2/50 ${sel.id === s.id ? "bg-bg-s2/60" : ""}`}
                    >
                      <td className="px-4 py-2 font-mono text-ink-hi">{s.code}</td>
                      <td className="px-4 py-2 text-ink-mid">{zones.find(z => z.id === s.zoneId)?.name}</td>
                      <td className="px-4 py-2 font-mono text-[11px] text-ink-mid">{s.type}</td>
                      <td className="px-4 py-2 text-right font-mono" style={{ color: severityHex(s.status) }}>
                        {s.value}<span className="text-[10px] text-ink-lo ml-0.5">{s.unit}</span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-[11px] text-ink-lo">
                        {s.threshold.warn} / {s.threshold.crit}
                      </td>
                      <td className="px-4 py-2">
                        <Sparkline data={s.history.slice(-24)} color={severityHex(s.status)} width={80} height={22} />
                      </td>
                      <td className="px-4 py-2"><StatusBadge severity={s.status} className="scale-90" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Panel title="Sensor Detail" subtitle={sel.code}>
            <div className="text-lg text-ink-hi">{sel.name}</div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-lo">
              {zones.find(z => z.id === sel.zoneId)?.name} · {sel.type}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-5xl font-bold tabular-nums" style={{ color: severityHex(sel.status) }}>
                {sel.value}
              </span>
              <span className="font-mono text-xs text-ink-lo">{sel.unit}</span>
            </div>
            <div className="mt-3">
              <Sparkline data={sel.history} color={severityHex(sel.status)} width={330} height={80} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
              <Cell label="Warn" value={sel.threshold.warn} />
              <Cell label="Crit" value={sel.threshold.crit} />
              <Cell label="Last calibrated" value={sel.lastCalibrated} />
              <Cell label="Status" value={sel.status.toUpperCase()} />
            </div>
          </Panel>

          <Panel title="Calibration Health" dense>
            <div className="space-y-1.5 text-xs">
              <Row label="Total sensors" value={SENSORS.length} />
              <Row label="Calibrated <30d" value={SENSORS.length - 3} tone="safe" />
              <Row label="Calibrated 30-90d" value={2} tone="elevated" />
              <Row label="Overdue >90d" value={1} tone="critical" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
function Cell({ label, value }: any) { return (<div className="border border-line/60 bg-bg-s2/40 p-2"><div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">{label}</div><div className="text-ink-hi">{value}</div></div>); }
function Row({ label, value, tone }: any) {
  const t: any = { safe: "text-sev-safe", elevated: "text-sev-elevated", critical: "text-sev-critical" };
  return <div className="flex items-center justify-between border-b border-line/40 py-1 last:border-0"><span className="text-ink-mid">{label}</span><span className={`font-mono ${t[tone] ?? "text-ink-hi"}`}>{value}</span></div>;
}
