"use client";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { plants } from "@/lib/mock";
import { Building2, Users, Signal, MapPin } from "lucide-react";
import { severityColor } from "@/lib/utils";
import Link from "next/link";

export default function PlantsPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl">Plants</h1>
        <p className="mt-1 text-sm text-ink-mid">Fleet-wide safety intelligence across {plants.length} sites.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {plants.map((p) => {
          const sev = severityColor(p.risk);
          return (
            <Link
              key={p.id}
              href="/"
              data-testid={`plant-card-${p.code}`}
              className="group block border border-line bg-bg-s1/70 p-5 transition-colors hover:border-line-strong"
            >
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-ink-lo" />
                <span className="font-mono text-[11px] text-ink-lo">{p.code}</span>
                <StatusBadge severity={sev as any} className="ml-auto" />
              </div>
              <div className="mt-1 text-lg text-ink-hi">{p.name}</div>
              <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-ink-lo">
                <MapPin size={10}/> {p.location}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="border border-line/60 bg-bg-s2/40 p-2 text-center">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">Risk</div>
                  <div className="text-lg text-ink-hi">{p.risk}</div>
                </div>
                <div className="border border-line/60 bg-bg-s2/40 p-2 text-center">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">Workers</div>
                  <div className="flex items-center justify-center gap-1 text-ink-hi"><Users size={11}/>{p.workers}</div>
                </div>
                <div className="border border-line/60 bg-bg-s2/40 p-2 text-center">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">Sensors</div>
                  <div className="flex items-center justify-center gap-1 text-ink-hi"><Signal size={11}/>{p.sensors}</div>
                </div>
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mid">
                Status · <span className={p.status === "OPERATIONAL" ? "text-sev-safe" : p.status === "MAINTENANCE" ? "text-sev-elevated" : "text-ink-lo"}>{p.status}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
