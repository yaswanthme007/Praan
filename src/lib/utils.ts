import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(score: number) {
  if (score >= 75) return "critical";
  if (score >= 55) return "elevated";
  if (score >= 30) return "watch";
  return "safe";
}

export function severityHex(sev: string) {
  const map: Record<string, string> = {
    safe: "#00FF66",
    watch: "#00E5FF",
    elevated: "#FFAB00",
    critical: "#FF3B30",
    offline: "#71717A",
  };
  return map[sev] ?? "#71717A";
}

export function formatTime(d: Date | string | number) {
  const date = new Date(d);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(d: Date | string | number) {
  const date = new Date(d);
  return `${date.toISOString().slice(0, 10)} ${formatTime(date)}`;
}

export function relTime(d: Date | string | number) {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function pad(n: number, w = 2) {
  return n.toString().padStart(w, "0");
}

// Deterministic pseudo-random so SSR & client match
export function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
