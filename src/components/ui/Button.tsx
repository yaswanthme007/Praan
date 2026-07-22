"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "critical";
type Size = "xs" | "sm" | "md";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent-cyan text-black hover:bg-accent-cyan/90 border border-accent-cyan",
  secondary:
    "bg-bg-s2 text-ink-hi border border-line hover:border-line-strong hover:bg-bg-s3",
  ghost:
    "bg-transparent text-ink-mid border border-transparent hover:text-ink-hi hover:bg-bg-s2",
  danger:
    "bg-transparent text-sev-critical border border-sev-critical/50 hover:bg-sev-critical/10",
  critical:
    "bg-sev-critical text-black border border-sev-critical hover:brightness-110",
};
const sizeStyles: Record<Size, string> = {
  xs: "h-6 px-2 text-[11px] font-mono uppercase tracking-[0.18em]",
  sm: "h-8 px-3 text-xs font-mono uppercase tracking-[0.16em]",
  md: "h-10 px-4 text-sm font-mono uppercase tracking-[0.14em]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ variant = "secondary", size = "sm", className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      {...rest}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap transition-colors focus:outline-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    />
  );
});
