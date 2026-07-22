"use client";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { compoundRules, safetyRegulations } from "@/lib/mock";
import { Zap, BookOpen, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function RulesPage() {
  const [sel, setSel] = useState(compoundRules[0]);
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl">Rule Library</h1>
        <p className="mt-1 text-sm text-ink-mid">Compound safety rules · triggered rules · regulations mapping.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Panel title={`Compound Rules · ${compoundRules.length}`}>
            <ul className="space-y-2">
              {compoundRules.map((r) => (
                <li
                  key={r.id}
                  data-testid={`rule-${r.code}`}
                  onClick={() => setSel(r)}
                  className={`cursor-pointer border p-3 transition-colors ${
                    sel.id === r.id ? "border-accent-cyan/60 bg-bg-s2/60" : "border-line hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} className={r.triggered ? "text-sev-critical" : "text-ink-lo"} />
                    <span className="font-mono text-[11px] text-ink-lo">{r.code}</span>
                    <StatusBadge severity={r.severity} pulse={r.triggered} />
                    {r.triggered && <span className="ml-1 font-mono text-[10px] text-sev-critical">TRIGGERED</span>}
                    <span className="ml-auto font-mono text-[10px] text-ink-mid">{r.regulation}</span>
                  </div>
                  <div className="mt-1 text-sm text-ink-hi">{r.name}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.conditions.map((c) => (
                      <span key={c} className="border border-line/60 bg-bg-s1 px-1.5 py-0.5 font-mono text-[10px] text-ink-mid">{c}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <Panel title="Rule Detail" subtitle={sel.code}>
            <div className="text-lg text-ink-hi">{sel.name}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
              <Cell label="Severity" value={sel.severity.toUpperCase()} />
              <Cell label="Regulation" value={sel.regulation} />
              <Cell label="Status" value={sel.triggered ? "TRIGGERED" : "ARMED"} />
              <Cell label="Version" value="v3.2" />
            </div>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">Conditions (AND)</div>
            <div className="mt-1 space-y-1">
              {sel.conditions.map((c, i) => (
                <div key={c} className="flex items-center gap-2 border border-line/60 bg-bg-s2/40 px-2 py-1.5 text-xs">
                  <span className="font-mono text-[10px] text-ink-lo">{i + 1}</span>
                  <span className="text-ink-hi">{c}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Regulations Mapping">
            <ul className="space-y-1.5 text-xs">
              {safetyRegulations.map((r) => (
                <li key={r.code} className="flex items-center justify-between border-b border-line/40 py-1.5 last:border-0">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-accent-cyan"/>
                    <div>
                      <div className="font-mono text-[11px] text-ink-hi">{r.code}</div>
                      <div className="text-[10px] text-ink-lo">{r.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] text-ink-lo">{r.region}</div>
                    <div className="font-mono text-[11px] text-sev-elevated">{r.triggered} triggered</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
function Cell({label,value}:any){return <div className="border border-line/60 bg-bg-s2/40 p-2"><div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">{label}</div><div className="text-ink-hi">{value}</div></div>;}
