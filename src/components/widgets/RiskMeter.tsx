"use client";
import { useEffect, useState } from "react";
import { severityColor, severityHex } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/** Half-donut risk meter with animated needle and severity-colored arc. */
export function RiskMeter({
  score,
  size = 260,
  label = "Compound Risk",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const [display, setDisplay] = useState(score);
  useEffect(() => setDisplay(score), [score]);
  const sev = severityColor(display);
  const color = severityHex(sev);

  // Arc math
  const R = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 180;
  const endAngle = 360;
  const scoreAngle = startAngle + ((endAngle - startAngle) * display) / 100;

  const arcPath = (from: number, to: number) => {
    const a1 = (from * Math.PI) / 180;
    const a2 = (to * Math.PI) / 180;
    const x1 = +(cx + R * Math.cos(a1)).toFixed(3);
    const y1 = +(cy + R * Math.sin(a1)).toFixed(3);
    const x2 = +(cx + R * Math.cos(a2)).toFixed(3);
    const y2 = +(cy + R * Math.sin(a2)).toFixed(3);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  };

  const ticks = Array.from({ length: 21 }, (_, i) => i * 5);

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
        {/* base arc */}
        <path
          d={arcPath(startAngle, endAngle)}
          stroke="#27272A"
          strokeWidth={10}
          fill="none"
        />
        {/* gradient severity arc */}
        <defs>
          <linearGradient id="riskGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#00FF66" />
            <stop offset="45%" stopColor="#FFAB00" />
            <stop offset="80%" stopColor="#FF3B30" />
          </linearGradient>
        </defs>
        <motion.path
          d={arcPath(startAngle, scoreAngle)}
          stroke="url(#riskGrad)"
          strokeWidth={10}
          fill="none"
          initial={false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
        {/* ticks */}
        {ticks.map((t) => {
          const a = ((startAngle + ((endAngle - startAngle) * t) / 100) * Math.PI) / 180;
          const inner = R - 4;
          const outer = R + (t % 25 === 0 ? 8 : 4);
          return (
            <line
              key={t}
              x1={+(cx + inner * Math.cos(a)).toFixed(3)}
              y1={+(cy + inner * Math.sin(a)).toFixed(3)}
              x2={+(cx + outer * Math.cos(a)).toFixed(3)}
              y2={+(cy + outer * Math.sin(a)).toFixed(3)}
              stroke={t % 25 === 0 ? "#A1A1AA" : "#3F3F46"}
              strokeWidth={t % 25 === 0 ? 1.3 : 0.8}
            />
          );
        })}
        {/* Needle */}
        <motion.g
          initial={false}
          animate={{ rotate: scoreAngle - 180 }}
          transition={{ type: "spring", stiffness: 100, damping: 14 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <line x1={cx} y1={cy} x2={cx + R - 8} y2={cy} stroke={color} strokeWidth={2} />
          <circle cx={cx + R - 8} cy={cy} r={4} fill={color} />
        </motion.g>
        <circle cx={cx} cy={cy} r={6} fill="#0D0D10" stroke={color} strokeWidth={1.5} />
      </svg>

      {/* Score readout — pushed up over the arc center */}
      <div className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink-lo">
          {label}
        </div>
        <div
          className="mt-1 font-mono text-6xl font-bold leading-none tracking-tighter"
          style={{ color }}
        >
          {Math.round(display)}
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color }}>
          {sev}
        </div>
      </div>

      <div className="mt-2 flex w-full justify-between px-4 font-mono text-[10px] text-ink-lo">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
