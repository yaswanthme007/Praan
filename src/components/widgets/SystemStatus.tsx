"use client";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";

const services = [
  { name: "SCADA Bridge", status: "safe" as const, latency: "18ms" },
  { name: "Gas Sensor Mesh", status: "safe" as const, latency: "42ms" },
  { name: "Worker RFID Tracking", status: "safe" as const, latency: "61ms" },
  { name: "Permit-to-Work API", status: "safe" as const, latency: "88ms" },
  { name: "Maintenance CMMS", status: "watch" as const, latency: "312ms" },
  { name: "Weather Feed (IMD)", status: "safe" as const, latency: "224ms" },
  { name: "PRAAN Inference Engine", status: "safe" as const, latency: "9ms" },
  { name: "Video/CCTV Bridge", status: "elevated" as const, latency: "1.2s" },
];

export function SystemStatus() {
  return (
    <Panel title="System Status" subtitle="Data feeds & AI">
      <ul className="grid grid-cols-1 gap-1">
        {services.map((s) => (
          <li key={s.name} className="flex items-center justify-between border-b border-line/40 py-1.5 last:border-0">
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  s.status === "safe"
                    ? "bg-sev-safe animate-pulseDot"
                    : s.status === "watch"
                    ? "bg-sev-watch"
                    : "bg-sev-elevated"
                }`}
              />
              <span className="text-xs text-ink-hi">{s.name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-ink-lo">
              <span className="tabular-nums">{s.latency}</span>
              <StatusBadge severity={s.status} className="scale-90" />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
