"use client";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { sensors, workers, zones, permits, maintenance } from "@/lib/mock";
import { severityHex } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Minus, Plus, Locate, ScanLine } from "lucide-react";
import { useState } from "react";

type Layer = "risk" | "sensors" | "workers" | "permits" | "maintenance";

const layerLabels: Record<Layer, string> = {
  risk: "Risk Heatmap",
  sensors: "Sensors",
  workers: "Workers",
  permits: "Permits",
  maintenance: "Maintenance",
};

export function PlantMap({ hero = false }: { hero?: boolean }) {
  const [layers, setLayers] = useState<Record<Layer, boolean>>({
    risk: true,
    sensors: true,
    workers: true,
    permits: true,
    maintenance: true,
  });
  const [selected, setSelected] = useState<any>(null);

  const toggle = (l: Layer) => setLayers((prev) => ({ ...prev, [l]: !prev[l] }));

  return (
    <div className={`relative w-full ${hero ? "h-[70vh] min-h-[560px]" : "aspect-[16/9]"}`}>
      <div className="absolute inset-0 border border-line bg-bg-s1 overflow-hidden">
        {/* Blueprint background */}
        <div className="absolute inset-0 bg-grid-blueprint" />
        <div className="scanlines absolute inset-0" />

        <TransformWrapper
          initialScale={1}
          minScale={0.7}
          maxScale={4}
          wheel={{ step: 0.15 }}
          doubleClick={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%" }}
              >
                <svg
                  viewBox="0 0 100 70"
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Outer facility perimeter */}
                  <rect x="1" y="1" width="98" height="68" fill="none" stroke="#00E5FF" strokeOpacity="0.35" strokeWidth="0.15" strokeDasharray="0.6 0.4" />
                  {/* Coordinate ticks */}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <g key={i} opacity="0.4">
                      <text x={i * 10} y={0.9} fontSize="0.7" fill="#3F3F46" fontFamily="JetBrains Mono">
                        {String.fromCharCode(65 + i)}
                      </text>
                      <text x={0.1} y={i * 6.5 + 3} fontSize="0.7" fill="#3F3F46" fontFamily="JetBrains Mono">
                        {(i + 1).toString().padStart(2, "0")}
                      </text>
                    </g>
                  ))}

                  {/* Zones */}
                  {zones.map((z) => {
                    const sev = z.risk >= 75 ? "critical" : z.risk >= 55 ? "elevated" : z.risk >= 30 ? "watch" : "safe";
                    const color = severityHex(sev);
                    const fill = layers.risk ? color : "transparent";
                    const opacity = layers.risk ? 0.12 : 0;
                    return (
                      <g key={z.id} onClick={() => setSelected({ kind: "zone", data: z })} style={{ cursor: "pointer" }}>
                        <rect
                          x={z.x}
                          y={z.y}
                          width={z.w}
                          height={z.h}
                          fill={fill}
                          fillOpacity={opacity}
                          stroke={color}
                          strokeOpacity={sev === "critical" ? 0.9 : 0.5}
                          strokeWidth="0.2"
                        />
                        <text
                          x={z.x + 1}
                          y={z.y + 2.2}
                          fontSize="1.1"
                          fill="#F4F4F5"
                          fontFamily="JetBrains Mono"
                          fontWeight="600"
                        >
                          {z.code}
                        </text>
                        <text
                          x={z.x + 1}
                          y={z.y + 3.7}
                          fontSize="0.9"
                          fill="#A1A1AA"
                          fontFamily="Chivo"
                        >
                          {z.name}
                        </text>
                        <text
                          x={z.x + z.w - 1}
                          y={z.y + z.h - 1}
                          fontSize="1.6"
                          textAnchor="end"
                          fill={color}
                          fontFamily="JetBrains Mono"
                          fontWeight="700"
                        >
                          {z.risk}
                        </text>
                        {sev === "critical" && (
                          <rect
                            x={z.x}
                            y={z.y}
                            width={z.w}
                            height={z.h}
                            fill="none"
                            stroke={color}
                            strokeWidth="0.15"
                            strokeDasharray="0.5 0.4"
                            className="animate-pulse"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Pipe/road lines */}
                  <path
                    d="M 30 22 L 56 22 M 56 22 L 56 36 M 78 30 L 90 30 M 4 65 L 96 65"
                    stroke="#3F3F46"
                    strokeWidth="0.25"
                    strokeDasharray="0.4 0.2"
                    fill="none"
                  />

                  {/* Sensors */}
                  {layers.sensors &&
                    sensors.map((s) => (
                      <g key={s.id} onClick={() => setSelected({ kind: "sensor", data: s })} style={{ cursor: "pointer" }}>
                        <circle
                          cx={s.x}
                          cy={s.y}
                          r={s.status === "critical" ? 1.2 : 0.7}
                          fill={severityHex(s.status)}
                          opacity={s.status === "critical" ? 0.35 : 0.15}
                        />
                        <circle cx={s.x} cy={s.y} r={0.35} fill={severityHex(s.status)} />
                      </g>
                    ))}

                  {/* Workers */}
                  {layers.workers &&
                    workers.map((w) => {
                      const color =
                        w.status === "EMERGENCY" ? "#FF3B30" :
                        w.status === "ACTIVE" ? "#00E5FF" :
                        "#71717A";
                      return (
                        <g key={w.id} onClick={() => setSelected({ kind: "worker", data: w })} style={{ cursor: "pointer" }}>
                          <circle cx={w.x} cy={w.y} r={0.8} fill={color} opacity={0.25} />
                          <rect x={w.x - 0.4} y={w.y - 0.4} width={0.8} height={0.8} fill={color} />
                        </g>
                      );
                    })}

                  {/* Permits */}
                  {layers.permits &&
                    permits
                      .filter((p) => p.status === "ACTIVE")
                      .map((p, i) => {
                        const zone = zones.find((z) => z.id === p.zoneId)!;
                        return (
                          <g key={p.id} onClick={() => setSelected({ kind: "permit", data: p })} style={{ cursor: "pointer" }}>
                            <polygon
                              points={`${zone.x + 2},${zone.y + zone.h - 2.5} ${zone.x + 3.4},${zone.y + zone.h - 0.5} ${zone.x + 0.6},${zone.y + zone.h - 0.5}`}
                              fill="#FFAB00"
                              opacity="0.9"
                            />
                          </g>
                        );
                      })}

                  {/* Maintenance */}
                  {layers.maintenance &&
                    maintenance
                      .filter((m) => m.status === "IN PROGRESS")
                      .map((m) => {
                        const zone = zones.find((z) => z.id === m.zoneId)!;
                        return (
                          <g key={m.id} onClick={() => setSelected({ kind: "maint", data: m })} style={{ cursor: "pointer" }}>
                            <rect
                              x={zone.x + zone.w - 3.5}
                              y={zone.y + zone.h - 2.5}
                              width={3}
                              height={2}
                              fill="#00E5FF"
                              opacity="0.6"
                              stroke="#00E5FF"
                              strokeWidth="0.1"
                            />
                            <text
                              x={zone.x + zone.w - 2}
                              y={zone.y + zone.h - 1}
                              fontSize="1"
                              textAnchor="middle"
                              fill="#050505"
                              fontFamily="JetBrains Mono"
                              fontWeight="700"
                            >
                              M
                            </text>
                          </g>
                        );
                      })}
                </svg>
              </TransformComponent>

              {/* Controls */}
              <div className="absolute right-3 top-3 flex flex-col gap-1">
                <button
                  data-testid="map-zoom-in"
                  onClick={() => zoomIn()}
                  className="flex h-8 w-8 items-center justify-center border border-line bg-bg-s1/90 text-ink-mid hover:text-ink-hi"
                >
                  <Plus size={14} />
                </button>
                <button
                  data-testid="map-zoom-out"
                  onClick={() => zoomOut()}
                  className="flex h-8 w-8 items-center justify-center border border-line bg-bg-s1/90 text-ink-mid hover:text-ink-hi"
                >
                  <Minus size={14} />
                </button>
                <button
                  data-testid="map-reset"
                  onClick={() => resetTransform()}
                  className="flex h-8 w-8 items-center justify-center border border-line bg-bg-s1/90 text-ink-mid hover:text-ink-hi"
                >
                  <Locate size={14} />
                </button>
                <button
                  data-testid="map-zoom-reset"
                  aria-hidden="true"
                  onClick={() => resetTransform()}
                  className="sr-only"
                >reset</button>
              </div>
            </>
          )}
        </TransformWrapper>

        {/* Layer toggle */}
        <div className="absolute left-3 top-3 border border-line bg-bg-s1/90 p-2 backdrop-blur">
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">
            <ScanLine size={12} /> Layers
          </div>
          <div className="flex flex-col gap-1">
            {(Object.keys(layerLabels) as Layer[]).map((l) => (
              <label
                key={l}
                className="flex cursor-pointer items-center gap-2 text-[11px] text-ink-mid hover:text-ink-hi"
              >
                <input
                  type="checkbox"
                  data-testid={`layer-toggle-${l}`}
                  checked={layers[l]}
                  onChange={() => toggle(l)}
                  className="h-3 w-3 accent-accent-cyan"
                />
                {layerLabels[l]}
              </label>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 border border-line bg-bg-s1/90 px-3 py-1.5 font-mono text-[10px] text-ink-mid">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-sev-critical" /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-sev-elevated" /> Elevated</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-sev-watch" /> Watch</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-sev-safe" /> Safe</span>
        </div>

        {/* Inspector */}
        {selected && (
          <div
            data-testid="map-inspector"
            className="absolute right-3 bottom-3 w-80 border border-line bg-bg-s1/95 p-3 backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">
                {selected.kind} inspector
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-ink-lo hover:text-ink-hi"
                aria-label="Close inspector"
              >
                ×
              </button>
            </div>
            {selected.kind === "zone" && (
              <>
                <div className="text-sm text-ink-hi">{selected.data.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-ink-lo">
                  {selected.data.code} · {selected.data.type}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <Stat label="Risk" value={selected.data.risk} />
                  <Stat label="Workers" value={selected.data.workers} />
                </div>
              </>
            )}
            {selected.kind === "sensor" && (
              <>
                <div className="text-sm text-ink-hi">{selected.data.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-ink-lo">
                  {selected.data.code} · {selected.data.type}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <Stat label="Value" value={`${selected.data.value} ${selected.data.unit}`} />
                  <Stat label="Warn" value={`${selected.data.threshold.warn}`} />
                  <Stat label="Crit" value={`${selected.data.threshold.crit}`} />
                  <Stat label="Status" value={selected.data.status.toUpperCase()} />
                </div>
              </>
            )}
            {selected.kind === "worker" && (
              <>
                <div className="text-sm text-ink-hi">{selected.data.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-ink-lo">
                  {selected.data.role}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <Stat label="HR" value={`${selected.data.vitals.hr} bpm`} />
                  <Stat label="Temp" value={`${selected.data.vitals.temp}°C`} />
                  <Stat label="Status" value={selected.data.status} />
                </div>
              </>
            )}
            {selected.kind === "permit" && (
              <>
                <div className="text-sm text-ink-hi">{selected.data.type}</div>
                <div className="mt-0.5 font-mono text-[10px] text-ink-lo">
                  {selected.data.code} · {selected.data.contractor}
                </div>
              </>
            )}
            {selected.kind === "maint" && (
              <>
                <div className="text-sm text-ink-hi">{selected.data.equipment}</div>
                <div className="mt-0.5 font-mono text-[10px] text-ink-lo">
                  {selected.data.code} · {selected.data.team} · {selected.data.progress}%
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="border border-line/60 bg-bg-s2/40 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-[0.2em] text-ink-lo">{label}</div>
      <div className="text-ink-hi">{value}</div>
    </div>
  );
}
