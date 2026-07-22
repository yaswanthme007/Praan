"use client";
import { useState } from "react";
import Image from "next/image";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { incidents, zones } from "@/lib/mock";
import { RelTime, DateTimeString } from "@/components/ui/RelTime";
import { FileText, MapPin, Clock, Camera, Download } from "lucide-react";

const tabs = ["OPEN", "CONTAINED", "RESOLVED", "ALL"] as const;

export default function IncidentsPage() {
  const [tab, setTab] = useState<typeof tabs[number]>("OPEN");
  const [sel, setSel] = useState(incidents[0].id);
  const filtered = incidents.filter((i) => (tab === "ALL" ? true : i.status === tab));
  const active = incidents.find((i) => i.id === sel) ?? filtered[0];

  return (
    <div className="mx-auto max-w-[1700px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">Incident Center</h1>
          <p className="mt-1 text-sm text-ink-mid">Timeline · root cause · evidence · generated report</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-9 px-3 font-mono text-[11px] uppercase tracking-[0.2em] ${
              tab === t ? "border-b-2 border-accent-cyan text-ink-hi" : "text-ink-lo hover:text-ink-hi"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((i) => (
            <div
              key={i.id}
              data-testid={`incident-card-${i.code}`}
              onClick={() => setSel(i.id)}
              className={`cursor-pointer border p-4 transition-colors ${
                sel === i.id
                  ? "border-accent-cyan/60 bg-bg-s2/60"
                  : "border-line bg-bg-s1/70 hover:border-line-strong"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-ink-lo">{i.code}</span>
                <StatusBadge severity={i.severity} />
              </div>
              <div className="mt-1.5 text-sm text-ink-hi">{i.title}</div>
              <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-ink-mid">
                <span className="inline-flex items-center gap-1"><MapPin size={11}/>{zones.find(z => z.id === i.zoneId)?.name}</span>
                <span className="inline-flex items-center gap-1"><Clock size={11}/><RelTime ts={i.opened} /></span>
                <span className="ml-auto uppercase tracking-[0.2em]">{i.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-7">
          {active && (
            <Panel
              title={active.code}
              subtitle={<>Zone {zones.find(z => z.id === active.zoneId)?.code} · opened <DateTimeString ts={active.opened} /></>}
              accent={active.severity === "critical" ? "critical" : "elevated"}
              actions={
                <div className="flex items-center gap-2">
                  <StatusBadge severity={active.severity} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mid">{active.status}</span>
                </div>
              }
            >
              <h3 className="text-xl text-ink-hi">{active.title}</h3>

              <div className="mt-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">Timeline</div>
                <ol className="space-y-1.5 border-l border-line/60 pl-3">
                  <TL t="T-00:00" text="Compound rule CR-014 triggered · Compound Risk 74" tone="critical" />
                  <TL t="T-00:30" text="Safety Officer Priya Kapoor acknowledged alert" />
                  <TL t="T-01:12" text="Hot Work permit halted via SCADA" />
                  <TL t="T-01:45" text="Zone Z-01 vented · gas readings stabilising" />
                  {active.status !== "OPEN" && <TL t="T-14:00" text="Root cause identified · maintenance blocker" tone="watch" />}
                  {active.status === "RESOLVED" && <TL t="T-22:00" text="Incident closed · report generated" tone="safe" />}
                </ol>
              </div>

              {active.rootCause && (
                <div className="mt-4 border border-line/70 bg-bg-s2/40 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">Root Cause</div>
                  <div className="mt-1 text-sm text-ink-hi">{active.rootCause}</div>
                </div>
              )}

              {active.evidence.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">Evidence · CCTV</div>
                    <Button variant="ghost" size="xs"><Download size={12}/>Export</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {active.evidence.map((src, i) => (
                      <div key={i} className="scanlines relative overflow-hidden border border-line">
                        <Image
                          src={src}
                          alt="evidence"
                          width={480}
                          height={280}
                          className="h-40 w-full object-cover opacity-90"
                          unoptimized
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1 font-mono text-[10px] text-ink-mid">
                          <span>CAM-{i + 3}</span>
                          <span><DateTimeString ts={active.opened} /></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary"><FileText size={12}/>Generate Report</Button>
                <Button variant="secondary"><Camera size={12}/>Add Evidence</Button>
                {active.status !== "RESOLVED" && (
                  <Button variant="danger" data-testid="incident-mark-resolved">Mark Resolved</Button>
                )}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function TL({ t, text, tone }: { t: string; text: string; tone?: "critical" | "safe" | "watch" }) {
  const color =
    tone === "critical" ? "bg-sev-critical border-sev-critical" :
    tone === "safe" ? "bg-sev-safe border-sev-safe" :
    tone === "watch" ? "bg-sev-watch border-sev-watch" :
    "bg-bg-s2 border-ink-lo";
  return (
    <li className="relative pl-3">
      <span className={`absolute -left-[15px] top-1.5 h-2 w-2 border ${color}`} />
      <div className="flex items-baseline gap-2 text-xs">
        <span className="font-mono text-ink-lo w-16">{t}</span>
        <span className="text-ink-hi">{text}</span>
      </div>
    </li>
  );
}
