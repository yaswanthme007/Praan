"use client";
import { useEffect, useState } from "react";
import { sensors, zones } from "@/lib/mock";

export function Ticker() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 3000);
    return () => clearInterval(t);
  }, []);
  const items = sensors.slice(0, 18);
  return (
    <div
      data-testid="telemetry-ticker"
      className="relative overflow-hidden border-b border-line bg-bg-s1/70 py-1.5"
    >
      <div className="marquee-track">
        {[...items, ...items].map((s, i) => {
          const drift = ((tick * 7 + i * 3) % 20) / 10 - 1;
          const v = (s.value + drift).toFixed(1);
          const zone = zones.find((z) => z.id === s.zoneId);
          const color =
            s.status === "critical"
              ? "text-sev-critical"
              : s.status === "elevated"
              ? "text-sev-elevated"
              : "text-sev-safe";
          return (
            <span
              key={i}
              className="mx-6 inline-flex items-center gap-2 whitespace-nowrap font-mono text-[11px]"
            >
              <span className="text-ink-lo">{zone?.code}</span>
              <span className="text-ink-mid">{s.code}</span>
              <span className={color}>
                {v}
                <span className="ml-0.5 text-ink-lo">{s.unit}</span>
              </span>
              <span className="text-ink-dim">·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
