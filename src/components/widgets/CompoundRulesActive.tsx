"use client";
import { Panel } from "@/components/ui/Panel";
import { compoundRules } from "@/lib/mock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

export function CompoundRulesActive() {
  const active = compoundRules.filter((r) => r.triggered);
  return (
    <Panel
      title="Triggered Compound Rules"
      subtitle="Rule engine detected combinations that individual sensors miss"
      actions={
        <Link
          href="/rules"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan hover:underline"
        >
          Library →
        </Link>
      }
    >
      <ul className="space-y-2">
        {active.map((r) => (
          <li
            key={r.id}
            data-testid={`compound-rule-${r.code}`}
            className={`relative border p-3 ${
              r.severity === "critical"
                ? "border-sev-critical/40 bg-sev-critical/5"
                : "border-sev-elevated/40 bg-sev-elevated/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap
                size={14}
                className={r.severity === "critical" ? "text-sev-critical" : "text-sev-elevated"}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mid">
                {r.code}
              </span>
              <StatusBadge severity={r.severity} className="ml-1" />
              <span className="ml-auto font-mono text-[10px] text-ink-lo">
                {r.regulation}
              </span>
            </div>
            <div className="mt-1.5 text-sm text-ink-hi">{r.name}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.conditions.map((c) => (
                <span
                  key={c}
                  className="border border-line/60 bg-bg-s1 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-mid"
                >
                  {c}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
