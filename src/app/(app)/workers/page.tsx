"use client";
import Image from "next/image";
import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { workers, zones } from "@/lib/mock";
import { Search, Heart, Thermometer, MapPin, Radio } from "lucide-react";

export default function WorkersPage() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(workers[0]);
  const filtered = workers.filter(w => q === "" || `${w.name} ${w.role}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1700px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">Workers</h1>
          <p className="mt-1 text-sm text-ink-mid">{workers.length} on-site personnel · RFID + vitals · live position</p>
        </div>
        <div className="flex items-center gap-2 border border-line bg-bg-s1/70 px-2 py-1 min-w-[260px]">
          <Search size={14} className="text-ink-lo" />
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search worker…" className="w-full bg-transparent text-sm focus:outline-none" data-testid="workers-search"/>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((w) => {
              const emerg = w.status === "EMERGENCY";
              return (
                <div
                  key={w.id}
                  onClick={() => setSel(w)}
                  data-testid={`worker-card-${w.id}`}
                  className={`group cursor-pointer border p-3 transition-colors ${
                    emerg ? "border-sev-critical/60 bg-sev-critical/5" :
                    sel.id === w.id ? "border-accent-cyan/60 bg-bg-s2/60" :
                    "border-line bg-bg-s1/70 hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Image src={w.avatar} alt={w.name} width={48} height={48} className="h-12 w-12 object-cover" unoptimized />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm text-ink-hi">{w.name}</span>
                        <StatusBadge severity={
                          w.status === "EMERGENCY" ? "critical" :
                          w.status === "ACTIVE" ? "safe" :
                          w.status === "BREAK" ? "watch" : "offline"
                        } pulse={emerg} className="scale-75 origin-right" />
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px] text-ink-lo">{w.role}</div>
                      <div className="mt-2 flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-ink-mid"><MapPin size={11}/>{zones.find(z=>z.id===w.zoneId)?.code}</span>
                        <span className="flex items-center gap-1 text-ink-mid"><Heart size={11}/>{w.vitals.hr}</span>
                        <span className="flex items-center gap-1 text-ink-mid"><Thermometer size={11}/>{w.vitals.temp}°</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4">
          <Panel title="Worker Detail" subtitle={sel.name}>
            <div className="flex items-start gap-3">
              <Image src={sel.avatar} alt={sel.name} width={72} height={72} className="h-18 w-18 object-cover" unoptimized />
              <div>
                <div className="text-lg text-ink-hi">{sel.name}</div>
                <div className="font-mono text-[10px] text-ink-lo">{sel.role}</div>
                <div className="mt-2"><StatusBadge severity={
                  sel.status === "EMERGENCY" ? "critical" :
                  sel.status === "ACTIVE" ? "safe" :
                  sel.status === "BREAK" ? "watch" : "offline"
                } pulse={sel.status === "EMERGENCY"} /></div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
              <Cell label="Zone" value={zones.find(z=>z.id===sel.zoneId)?.name} />
              <Cell label="Heart Rate" value={`${sel.vitals.hr} bpm`} tone={sel.vitals.hr > 100 ? "elevated" : "safe"} />
              <Cell label="Body Temp" value={`${sel.vitals.temp} °C`} tone={sel.vitals.temp > 37.5 ? "elevated" : "safe"} />
              <Cell label="RFID" value={"BAY-" + sel.id.toUpperCase()} />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">Assigned Tasks</div>
              <TaskLine text="Rope-access inspection Tank T-11" status="IN PROGRESS" />
              <TaskLine text="PTW-2043 authorisation ack" status="DONE" />
              <TaskLine text="Zone Z-04 vibration walk-round" status="PENDING" />
            </div>
            <button className="mt-4 w-full border border-sev-critical/50 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-sev-critical hover:bg-sev-critical/10" data-testid="worker-signal-emergency">
              <Radio className="mr-2 inline" size={12}/>Signal Emergency
            </button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
function Cell({ label, value, tone }: any) {
  const t: any = { safe: "text-sev-safe", elevated: "text-sev-elevated", critical: "text-sev-critical" };
  return <div className="border border-line/60 bg-bg-s2/40 p-2"><div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">{label}</div><div className={`text-ink-hi ${t[tone] ?? ""}`}>{value}</div></div>;
}
function TaskLine({ text, status }: { text: string; status: string }) {
  const map: any = { "IN PROGRESS": "text-accent-cyan", "DONE": "text-sev-safe", "PENDING": "text-ink-lo" };
  return <div className="flex items-center justify-between border-b border-line/40 py-1 text-xs last:border-0"><span className="text-ink-hi">{text}</span><span className={`font-mono text-[10px] ${map[status]}`}>{status}</span></div>;
}
