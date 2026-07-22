"use client";
import { severityHex } from "@/lib/utils";

/**
 * Minimalist sparkline for sensor timeseries.
 */
export function Sparkline({
  data,
  color = "#00E5FF",
  width = 120,
  height = 32,
  showDot = true,
  fill = true,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showDot?: boolean;
  fill?: boolean;
}) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  const last = points[points.length - 1];
  const gradId = `sg-${color.replace("#", "")}-${data.length}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gradId})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      {showDot && (
        <>
          <circle cx={last[0]} cy={last[1]} r={4} fill={color} opacity="0.25" />
          <circle cx={last[0]} cy={last[1]} r={2} fill={color} />
        </>
      )}
    </svg>
  );
}
