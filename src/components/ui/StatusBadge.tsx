import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/mock";

const styles: Record<Severity, string> = {
  safe: "text-sev-safe border-sev-safe/40 bg-sev-safe/5",
  watch: "text-sev-watch border-sev-watch/40 bg-sev-watch/5",
  elevated: "text-sev-elevated border-sev-elevated/40 bg-sev-elevated/5",
  critical: "text-sev-critical border-sev-critical/40 bg-sev-critical/10",
  offline: "text-ink-lo border-line bg-transparent",
};

const labels: Record<Severity, string> = {
  safe: "SAFE",
  watch: "WATCH",
  elevated: "ELEVATED",
  critical: "CRITICAL",
  offline: "OFFLINE",
};

export function StatusBadge({
  severity,
  label,
  pulse = false,
  className,
}: {
  severity: Severity;
  label?: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      data-testid={`status-badge-${severity}`}
      className={cn(
        "inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-2xs font-mono uppercase tracking-[0.15em]",
        styles[severity],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          severity === "safe" && "bg-sev-safe",
          severity === "watch" && "bg-sev-watch",
          severity === "elevated" && "bg-sev-elevated",
          severity === "critical" && "bg-sev-critical",
          severity === "offline" && "bg-ink-lo",
          pulse && "animate-pulseDot"
        )}
      />
      {label ?? labels[severity]}
    </span>
  );
}
