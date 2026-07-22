"use client";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { FileText, Download, Calendar, ShieldCheck, AlertOctagon, Radio } from "lucide-react";

const reports = [
  { name: "Daily Safety Report", desc: "Compound risk profile, alerts, PTWs, incidents · last 24h", icon: Calendar, cat: "Daily" },
  { name: "Incident Report · INC-2026-014", desc: "Auto-generated · timeline + root cause + evidence", icon: AlertOctagon, cat: "Incident" },
  { name: "Weekly Risk Digest", desc: "Trend + top rules · sent to Plant Manager", icon: FileText, cat: "Risk" },
  { name: "Compliance Snapshot", desc: "OSHA 1910.119 · IS 15656 · IEC 61511", icon: ShieldCheck, cat: "Compliance" },
  { name: "Emergency Drill Log", desc: "Q4 2025 · muster times · responder KPIs", icon: Radio, cat: "Emergency" },
];

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">Reports</h1>
          <p className="mt-1 text-sm text-ink-mid">Signed PDF exports · JSON bundles · CSV telemetry.</p>
        </div>
        <Button variant="primary" data-testid="reports-new"><FileText size={12}/>New Report</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.name} className="group border border-line bg-bg-s1/70 p-4 transition-colors hover:border-line-strong">
              <div className="flex items-center justify-between">
                <Icon size={16} className="text-accent-cyan"/>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">{r.cat}</span>
              </div>
              <div className="mt-3 text-sm text-ink-hi">{r.name}</div>
              <p className="mt-1 text-xs text-ink-mid">{r.desc}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="xs">Preview</Button>
                <Button variant="ghost" size="xs" data-testid={`report-download-${r.cat}`}><Download size={11}/>Export</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
