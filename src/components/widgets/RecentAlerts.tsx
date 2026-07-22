"use client";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { initialAlerts } from "@/lib/mock";
import { RelTime } from "@/components/ui/RelTime";
import { AlertTriangle, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function RecentAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  return (
    <Panel
      title="Recent Alerts"
      subtitle={`${alerts.filter((a) => !a.ack).length} unacknowledged`}
      actions={
        <Link
          href="/alerts"
          data-testid="alerts-view-all"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan hover:underline"
        >
          View all →
        </Link>
      }
      className="h-full"
    >
      <ul className="-mx-4 -mb-4 divide-y divide-line/60">
        {alerts.slice(0, 6).map((a) => (
          <li
            key={a.id}
            data-testid={`alert-row-${a.id}`}
            className="group flex items-start gap-3 px-4 py-3 hover:bg-bg-s2/50"
          >
            <div
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                a.severity === "critical"
                  ? "bg-sev-critical animate-pulseDot"
                  : a.severity === "elevated"
                  ? "bg-sev-elevated"
                  : "bg-sev-watch"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <StatusBadge severity={a.severity} />
                <span className="font-mono text-[10px] text-ink-lo">
                  <RelTime ts={a.ts} />
                </span>
                {a.ack && (
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-ink-lo">
                    <Check size={10} /> ACK
                  </span>
                )}
              </div>
              <div className="mt-0.5 truncate text-sm text-ink-hi">{a.title}</div>
              <div className="mt-0.5 truncate text-xs text-ink-mid">
                {a.detail}
              </div>
            </div>
            <button
              data-testid={`alert-ack-${a.id}`}
              onClick={() =>
                setAlerts((prev) =>
                  prev.map((p) => (p.id === a.id ? { ...p, ack: true } : p))
                )
              }
              disabled={a.ack}
              className="opacity-0 transition-opacity group-hover:opacity-100 disabled:hidden border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-mid hover:text-accent-cyan hover:border-accent-cyan"
            >
              Ack
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
