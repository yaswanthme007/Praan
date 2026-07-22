"use client";
import { Panel } from "@/components/ui/Panel";
import { riskHistory24h } from "@/lib/mock";
import { severityHex, severityColor } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";

export function RiskTrendChart({ height = 220, title = "Compound Risk · 24h" }: { height?: number; title?: string }) {
  return (
    <Panel title={title} subtitle="15-min buckets · Predicted lead-time overlay">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart data={riskHistory24h} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="riskArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#FFAB00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272A" strokeDasharray="2 4" />
            <XAxis
              dataKey="t"
              tick={{ fill: "#52525B", fontFamily: "JetBrains Mono", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "#27272A" }}
              tickFormatter={(v) => {
                const hr = Math.floor((v * 15) / 60);
                return `${hr.toString().padStart(2, "0")}:00`;
              }}
              interval={11}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#52525B", fontFamily: "JetBrains Mono", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "#27272A" }}
            />
            <Tooltip
              contentStyle={{
                background: "#0D0D10",
                border: "1px solid #27272A",
                fontFamily: "JetBrains Mono",
                fontSize: 11,
                borderRadius: 0,
              }}
              labelStyle={{ color: "#A1A1AA" }}
              formatter={(v: any) => [`${v}`, "Risk"]}
              labelFormatter={(v: any) => `T-${((riskHistory24h.length - v) * 15).toFixed(0)}m`}
            />
            <ReferenceLine y={75} stroke="#FF3B30" strokeDasharray="4 4" label={{ value: "CRITICAL", fill: "#FF3B30", fontSize: 9, position: "left" }} />
            <ReferenceLine y={55} stroke="#FFAB00" strokeDasharray="4 4" label={{ value: "ELEVATED", fill: "#FFAB00", fontSize: 9, position: "left" }} />
            <ReferenceLine y={30} stroke="#00E5FF" strokeDasharray="4 4" label={{ value: "WATCH", fill: "#00E5FF", fontSize: 9, position: "left" }} />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#FF3B30"
              strokeWidth={1.6}
              fill="url(#riskArea)"
              isAnimationActive
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
