"use client";
import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { initialAlerts, zones } from "@/lib/mock";
import { RelTime, DateTimeString } from "@/components/ui/RelTime";
import { Bell, Check, User } from "lucide-react";

const tabs = ["ALL", "CRITICAL", "ELEVATED", "WATCH", "ACKNOWLEDGED"] as const;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [tab, setTab] = useState<typeof tabs[number]>("ALL");
  const [sel, setSel] = useState<string | null>(alerts[0]?.id ?? null);

  const filtered = alerts.filter((a) => {
    if (tab === "ALL") return true;
    if (tab === "ACKNOWLEDGED") return a.ack;
    return a.severity.toUpperCase() === tab;
  });
  const active = alerts.find((a) => a.id === sel) ?? filtered[0];

  const ack = (id: string) => setAlerts((prev) => prev.map((p) => (p.id === id ? { ...p, ack: true } : p)));

  return (
    <div className="mx-auto max-w-[1700px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">Alert Center</h1>
          <p className="mt-1 text-sm text-ink-mid">Acknowledge, escalate, assign. Every alert has a chain of custody.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" data-testid="alerts-ack-all" onClick={() => setAlerts(prev => prev.map(a => ({...a, ack: true})))}>
            <Check size={12}/> Acknowledge All
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-testid={`alerts-tab-${t.toLowerCase()}`}
            className={`h-9 px-3 font-mono text-[11px] uppercase tracking-[0.2em] ${
              tab === t ? "border-b-2 border-accent-cyan text-ink-hi" : "text-ink-lo hover:text-ink-hi"
            }`}
          >
            {t}
            <span className="ml-1.5 text-ink-lo">
              ({
                t === "ALL" ? alerts.length :
                t === "ACKNOWLEDGED" ? alerts.filter(a => a.ack).length :
                alerts.filter(a => a.severity.toUpperCase() === t).length
              })
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Panel title="Alert Queue" subtitle={`${filtered.length} in view`}>
            <ul className="-mx-4 -my-4 divide-y divide-line/60">
              {filtered.map((a) => (
                <li
                  key={a.id}
                  data-testid={`alert-item-${a.id}`}
                  onClick={() => setSel(a.id)}
                  className={`group cursor-pointer px-4 py-3 hover:bg-bg-s2/60 ${sel === a.id ? "bg-bg-s2/60" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge severity={a.severity} pulse={a.severity === "critical" && !a.ack} />
                    <span className="font-mono text-[10px] text-ink-lo"><DateTimeString ts={a.ts} /></span>
                    <span className="ml-auto font-mono text-[10px] text-ink-mid">{a.category}</span>
                  </div>
                  <div className="mt-1 text-sm text-ink-hi">{a.title}</div>
                  <div className="mt-0.5 flex items-center justify-between text-xs">
                    <span className="text-ink-mid truncate max-w-md">{a.detail}</span>
                    <div className="flex items-center gap-3">
                      {a.assignee && (
                        <span className="flex items-center gap-1 text-ink-lo">
                          <User size={10} /> {a.assignee}
                        </span>
                      )}
                      {a.ack ? (
                        <span className="font-mono text-[10px] text-ink-lo">ACK</span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); ack(a.id); }}
                          data-testid={`alert-ack-btn-${a.id}`}
                          className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase text-accent-cyan hover:bg-bg-s3"
                        >
                          Ack
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-5">
          {active && (
            <Panel title="Alert Details" subtitle={active.id.toUpperCase()} accent={active.severity === "critical" ? "critical" : active.severity === "elevated" ? "elevated" : "watch"}>
              <div className="flex items-center gap-2">
                <StatusBadge severity={active.severity} pulse={active.severity === "critical"} />
                <span className="font-mono text-[10px] text-ink-lo"><DateTimeString ts={active.ts} /> · <RelTime ts={active.ts} /></span>
              </div>
              <h3 className="mt-2 text-lg text-ink-hi">{active.title}</h3>
              <p className="mt-1 text-sm text-ink-mid">{active.detail}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
                <FieldCell label="Zone" value={zones.find(z => z.id === active.zoneId)?.name ?? "—"} />
                <FieldCell label="Category" value={active.category} />
                <FieldCell label="Assignee" value={active.assignee ?? "Unassigned"} />
                <FieldCell label="Acknowledged" value={active.ack ? "Yes" : "No"} />
              </div>

              <div className="mt-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">Escalation Path</div>
                <ol className="space-y-1.5 border-l border-line/60 pl-3">
                  <StepRow t="00:00" text="Sensor breach detected" done />
                  <StepRow t="+00:15" text="AI compound rule matched CR-014" done />
                  <StepRow t="+00:45" text="Alert dispatched to Safety Officer" done />
                  <StepRow t="+01:30" text="Escalation to Plant Manager (pending)" />
                  <StepRow t="+03:00" text="Notify Emergency Response Team (if unack)" />
                </ol>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" data-testid="alert-detail-ack" onClick={() => ack(active.id)} disabled={active.ack}>
                  {active.ack ? "Acknowledged" : "Acknowledge"}
                </Button>
                <Button variant="danger">Escalate</Button>
                <Button variant="secondary">Reassign</Button>
                <Button variant="ghost">Silence 5m</Button>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldCell({ label, value }: { label: string; value: any }) {
  return (
    <div className="border border-line/60 bg-bg-s2/40 p-2">
      <div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">{label}</div>
      <div className="text-ink-hi">{value}</div>
    </div>
  );
}
function StepRow({ t, text, done }: { t: string; text: string; done?: boolean }) {
  return (
    <li className="relative pl-3">
      <span className={`absolute -left-[15px] top-1.5 h-2 w-2 border ${done ? "bg-sev-safe border-sev-safe" : "border-ink-lo bg-bg-s2"}`} />
      <div className="flex items-baseline gap-2 text-xs">
        <span className="font-mono text-ink-lo w-14">{t}</span>
        <span className={done ? "text-ink-mid" : "text-ink-hi"}>{text}</span>
      </div>
    </li>
  );
}
