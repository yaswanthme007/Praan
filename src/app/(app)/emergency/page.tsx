"use client";
import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { workers, zones, initialAlerts } from "@/lib/mock";
import { TimeString } from "@/components/ui/RelTime";
import { AlertOctagon, Bell, MapPin, PhoneCall, Radio, ShieldAlert, Users, Video } from "lucide-react";
import { motion } from "framer-motion";

const checklist = [
  { id: 1, text: "Verify compound rule CR-014 · confirm sensors independently", who: "Priya · Safety" },
  { id: 2, text: "Halt Hot Work permit PTW-2041 via SCADA", who: "Rohit · SCADA" },
  { id: 3, text: "Initiate zone Z-01 evacuation announcement", who: "Priya · Safety" },
  { id: 4, text: "Deploy Response Team A to muster point M-2", who: "Meera · Response" },
  { id: 5, text: "Notify Plant Manager & District Fire", who: "Priya · Safety" },
  { id: 6, text: "Confirm all workers evacuated via RFID", who: "Zoya · Control" },
  { id: 7, text: "Isolate feed valve V-204", who: "Rohit · SCADA" },
  { id: 8, text: "Post situation report to command uplink", who: "Priya · Safety" },
];

export default function EmergencyPage() {
  const [seconds, setSeconds] = useState(2740);
  const [done, setDone] = useState<number[]>([1, 2]);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;

  const toggle = (id: number) => setDone((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="mx-auto max-w-[1700px] space-y-4">
      {/* Command banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="stripes-critical relative overflow-hidden border border-sev-critical/60 bg-sev-critical/10 p-5"
      >
        <div className="scanlines absolute inset-0" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-sev-critical">
              <Radio size={14} /> Emergency Command Active
            </div>
            <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-ink-hi">
              CR-014 · REACTOR BAY A
            </h1>
            <p className="mt-1 text-sm text-ink-mid">
              Compound risk critical · vent + evacuate + isolate initiated
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-lo">Elapsed</div>
            <div className="font-mono text-5xl font-bold tabular-nums text-sev-critical">
              {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="critical" data-testid="emergency-broadcast"><Radio size={14}/>Broadcast</Button>
            <Button variant="danger">Stand Down</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Panel title="Emergency Checklist" subtitle={`${done.length}/${checklist.length} complete`}>
            <ul className="space-y-1.5">
              {checklist.map((c) => {
                const isDone = done.includes(c.id);
                return (
                  <li
                    key={c.id}
                    data-testid={`checklist-${c.id}`}
                    className={`group flex cursor-pointer items-start gap-3 border p-2.5 transition-colors ${
                      isDone ? "border-sev-safe/40 bg-sev-safe/5" : "border-line hover:border-line-strong"
                    }`}
                    onClick={() => toggle(c.id)}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border font-mono text-[10px] ${
                        isDone ? "bg-sev-safe border-sev-safe text-black" : "border-ink-lo text-ink-lo"
                      }`}
                    >
                      {isDone ? "✓" : c.id}
                    </span>
                    <div className="flex-1">
                      <div className={`text-sm ${isDone ? "text-ink-mid line-through" : "text-ink-hi"}`}>
                        {c.text}
                      </div>
                      <div className="font-mono text-[10px] text-ink-lo">{c.who}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Panel title="Evacuation Status" subtitle="RFID + head-count">
            <div className="grid grid-cols-3 gap-2 font-mono">
              <StatCell label="In Zone" value="0" tone="safe" />
              <StatCell label="Evacuated" value="4" tone="cyan" />
              <StatCell label="Unaccounted" value="0" tone="safe" />
            </div>
            <div className="mt-3 space-y-1.5">
              {workers.slice(0, 6).map((w, i) => (
                <div key={w.id} className="flex items-center justify-between border-b border-line/40 py-1 last:border-0 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sev-safe" />
                    <span className="text-ink-hi">{w.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-lo">
                    Muster M-2 · <TimeString ts={new Date(Date.now() - i * 90_000).toISOString()} />
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Response Team" subtitle="Team Alpha · dispatched">
            <div className="space-y-1.5">
              {["Meera Nair · Team Lead", "Karan Puri · Firefighter", "Anjali Rao · Medic", "Yash Trivedi · Support"].map((r, i) => (
                <div key={r} className="flex items-center justify-between border-b border-line/40 py-1 text-xs last:border-0">
                  <span className="text-ink-hi">{r}</span>
                  <span className="font-mono text-[10px] text-sev-safe">EN ROUTE · ETA {(i + 2) * 40}s</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <Panel title="Communication">
            <div className="space-y-2">
              <Button variant="critical" className="w-full justify-center"><Radio size={13}/>Public Address</Button>
              <Button variant="danger" className="w-full justify-center"><PhoneCall size={13}/>Call Fire Dept</Button>
              <Button variant="secondary" className="w-full justify-center"><Bell size={13}/>SMS all workers</Button>
              <Button variant="secondary" className="w-full justify-center"><Video size={13}/>Open CCTV Wall</Button>
            </div>
          </Panel>
          <Panel title="Action Log" dense>
            <ul className="space-y-1.5">
              {initialAlerts.slice(0, 5).map((a) => (
                <li key={a.id} className="text-[11px]">
                  <span className="font-mono text-ink-lo"><TimeString ts={a.ts} /></span>{" "}
                  <span className="text-ink-mid">· {a.title}</span>
                </li>
              ))}
              <li className="text-[11px]">
                <span className="font-mono text-ink-lo"><TimeString ts={new Date().toISOString()} /></span>{" "}
                <span className="text-sev-safe">· Response Team dispatched</span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, tone }: any) {
  const map: any = { safe: "text-sev-safe", critical: "text-sev-critical", cyan: "text-accent-cyan", elevated: "text-sev-elevated" };
  return (
    <div className="border border-line/60 bg-bg-s2/40 p-2 text-center">
      <div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">{label}</div>
      <div className={`mt-0.5 text-2xl font-bold ${map[tone]}`}>{value}</div>
    </div>
  );
}
