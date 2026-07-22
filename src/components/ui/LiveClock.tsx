"use client";
import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";

export function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      data-testid="live-clock"
      suppressHydrationWarning
      className={"font-mono text-xs tabular-nums text-ink-mid " + (className ?? "")}
    >
      {now ? `${formatTime(now)} UTC` : "--:--:-- UTC"}
    </span>
  );
}
