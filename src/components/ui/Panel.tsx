"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  accent?: "none" | "critical" | "elevated" | "watch" | "safe";
  dense?: boolean;
  scanlines?: boolean;
  animate?: boolean;
  bare?: boolean;
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { title, subtitle, actions, accent = "none", dense, scanlines, animate = true, bare, className, children, ...rest },
  ref
) {
  const accentBar = {
    none: "",
    critical: "before:bg-sev-critical",
    elevated: "before:bg-sev-elevated",
    watch: "before:bg-sev-watch",
    safe: "before:bg-sev-safe",
  }[accent];

  const Comp: any = animate ? motion.div : "div";
  const motionProps = animate
    ? { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } }
    : {};

  return (
    <Comp
      ref={ref as any}
      {...motionProps}
      {...(rest as any)}
      className={cn(
        "relative border border-line bg-bg-s1/80 backdrop-blur-sm",
        !bare && "before:absolute before:inset-y-0 before:left-0 before:w-[2px]",
        accentBar,
        scanlines && "scanlines overflow-hidden",
        className
      )}
    >
      {(title || actions) && (
        <div
          className={cn(
            "flex items-center justify-between border-b border-line/70 px-4 py-2.5",
            dense && "py-2"
          )}
        >
          <div className="flex flex-col gap-0.5">
            {title && (
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mid">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-xs text-ink-lo">{subtitle}</div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("relative", !title && dense ? "p-3" : "", !title && !dense ? "p-4" : "p-4")}>{children}</div>
    </Comp>
  );
});
