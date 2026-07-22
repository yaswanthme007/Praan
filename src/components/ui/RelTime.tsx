"use client";
import { useEffect, useState } from "react";
import { relTime, formatTime, formatDateTime } from "@/lib/utils";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function RelTime({ ts, className }: { ts: string | Date | number; className?: string }) {
  const mounted = useMounted();
  return <span suppressHydrationWarning className={className}>{mounted ? relTime(ts) : "—"}</span>;
}
export function TimeString({ ts, className }: { ts: string | Date | number; className?: string }) {
  const mounted = useMounted();
  return <span suppressHydrationWarning className={className}>{mounted ? formatTime(ts) : "--:--:--"}</span>;
}
export function DateTimeString({ ts, className }: { ts: string | Date | number; className?: string }) {
  const mounted = useMounted();
  return <span suppressHydrationWarning className={className}>{mounted ? formatDateTime(ts) : "---- --:--:--"}</span>;
}
