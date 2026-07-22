"use client";
import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { permits, zones } from "@/lib/mock";
import { RelTime } from "@/components/ui/RelTime";
import { ClipboardCheck, Flame, Zap, ArrowUp, HardHat, Shovel } from "lucide-react";

const tabs = ["ACTIVE", "PENDING", "COMPLETED", "EXPIRED", "ALL"] as const;

const typeIcon: Record<string, any> = {
  "HOT WORK": Flame, "ELECTRICAL": Zap, "HEIGHT": ArrowUp, "CONFINED SPACE": HardHat, "EXCAVATION": Shovel,
};

export default function PermitsPage() {
  const [tab, setTab] = useState<typeof tabs[number]>("ACTIVE");
  const filtered = permits.filter(p => tab === "ALL" ? true : p.status === tab);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">Permit-to-Work</h1>
          <p className="mt-1 text-sm text-ink-mid">All PTWs · linked to zones, sensors, and compound rules.</p>
        </div>
        <Button variant="primary" data-testid="new-permit"><ClipboardCheck size={12}/>Open PTW</Button>
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((p) => {
          const Icon = typeIcon[p.type] ?? ClipboardCheck;
          const sev = p.status === "EXPIRED" ? "critical" : p.status === "ACTIVE" ? "elevated" : p.status === "PENDING" ? "watch" : "safe";
          return (
            <div key={p.id} data-testid={`permit-${p.code}`} className="border border-line bg-bg-s1/70 p-4">
              <div className="flex items-center gap-2">
                <Icon size={14} className={p.status === "ACTIVE" ? "text-sev-elevated" : "text-ink-lo"} />
                <span className="font-mono text-[11px] text-ink-lo">{p.code}</span>
                <StatusBadge severity={sev as any} className="ml-auto" />
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-hi">{p.type}</div>
              <div className="mt-1 text-sm text-ink-mid">{zones.find(z => z.id === p.zoneId)?.name}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[10px]">
                <div><div className="text-ink-lo">Contractor</div><div className="text-ink-hi">{p.contractor}</div></div>
                <div><div className="text-ink-lo">Expires</div><div className="text-ink-hi"><RelTime ts={p.expires} /></div></div>
              </div>
              <div className="mt-3 h-1 w-full bg-line/60">
                <div className={`h-full ${p.status === "ACTIVE" ? "bg-sev-elevated" : p.status === "PENDING" ? "bg-sev-watch" : "bg-line-strong"}`} style={{ width: p.status === "ACTIVE" ? "60%" : p.status === "PENDING" ? "10%" : "100%" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
