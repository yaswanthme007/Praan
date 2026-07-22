"use client";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/widgets/Sparkline";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function KpiTile({
  label,
  value,
  unit,
  delta,
  tone = "cyan",
  spark,
  icon,
  testid,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  tone?: "cyan" | "critical" | "elevated" | "safe" | "muted";
  spark?: number[];
  icon?: ReactNode;
  testid?: string;
}) {
  const toneMap = {
    cyan: "text-accent-cyan",
    critical: "text-sev-critical",
    elevated: "text-sev-elevated",
    safe: "text-sev-safe",
    muted: "text-ink-mid",
  } as const;
  const sparkColor = {
    cyan: "#00E5FF",
    critical: "#FF3B30",
    elevated: "#FFAB00",
    safe: "#00FF66",
    muted: "#71717A",
  }[tone];

  return (
    <motion.div
      data-testid={testid}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative border border-line bg-bg-s1/70 p-4 transition-colors hover:border-line-strong"
    >
      <div className="flex items-start justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">
          {label}
        </div>
        {icon && <div className="text-ink-lo">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn("font-mono text-4xl font-bold leading-none tracking-tight tabular-nums", toneMap[tone])}>
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-ink-lo">
            {unit}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between">
        {delta && (
          <span className={cn("font-mono text-[11px]", toneMap[tone])}>{delta}</span>
        )}
        {spark && (
          <div className="ml-auto">
            <Sparkline data={spark} color={sparkColor} width={90} height={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
