"use client";
import { useEffect, useRef, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/widgets/Sparkline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { incidents, riskHistory24h, sensors, zones } from "@/lib/mock";
import { TimeString } from "@/components/ui/RelTime";
import { Play, Pause, Rewind, FastForward, SkipBack, SkipForward } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, ReferenceLine, Tooltip } from "recharts";

const speeds = [0.5, 1, 2, 4, 8];

export default function ReplayPage() {
  const [t, setT] = useState(60);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!playing) { if (ref.current) clearInterval(ref.current); return; }
    ref.current = setInterval(() => setT((v) => (v >= 100 ? 100 : v + 1)), 500 / speed);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [playing, speed]);

  const scale = t / 100;
  const risk = Math.round(riskHistory24h[Math.min(riskHistory24h.length - 1, Math.floor(scale * (riskHistory24h.length - 1)))].v);
  const inc = incidents[0];

  const events = [
    { t: 5, label: "GA-101 crosses watch threshold" },
    { t: 22, label: "PTW-2041 Hot Work opened" },
    { t: 40, label: "Cooling loop maintenance starts" },
    { t: 58, label: "Compound rule CR-014 fires" },
    { t: 74, label: "Safety Officer acknowledges" },
    { t: 88, label: "Hot Work halted · zone vented" },
    { t: 96, label: "Incident contained" },
  ];

  return (
    <div className="mx-auto max-w-[1700px] space-y-4">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl">Incident Replay</h1>
        <p className="mt-1 text-sm text-ink-mid">Scrub through {inc.code} · {inc.title} · every telemetry & event replayed in sync.</p>
      </div>

      {/* Playback bar */}
      <Panel title="Replay Controls" subtitle={`Speed ${speed}× · virtual T = ${Math.round(scale * 46)}m`}>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="xs" onClick={() => setT(0)} data-testid="replay-restart"><SkipBack size={12}/></Button>
          <Button variant="secondary" size="xs" onClick={() => setT((v) => Math.max(0, v - 5))}><Rewind size={12}/></Button>
          <Button variant="primary" size="sm" data-testid="replay-play" onClick={() => setPlaying(p => !p)}>
            {playing ? <><Pause size={13}/>Pause</> : <><Play size={13}/>Play</>}
          </Button>
          <Button variant="secondary" size="xs" onClick={() => setT((v) => Math.min(100, v + 5))}><FastForward size={12}/></Button>
          <Button variant="secondary" size="xs" onClick={() => setT(100)}><SkipForward size={12}/></Button>

          <div className="ml-4 flex items-center gap-1">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`border px-2 py-0.5 font-mono text-[10px] ${
                  speed === s ? "border-accent-cyan text-accent-cyan bg-bg-s2" : "border-line text-ink-lo hover:text-ink-hi"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
          <div className="ml-auto font-mono text-[11px] text-ink-mid">
            <TimeString ts={new Date(new Date(inc.opened).getTime() + scale * 46 * 60_000).toISOString()} />
          </div>
        </div>
        <div className="relative mt-3">
          <input
            data-testid="replay-scrubber"
            type="range"
            min={0}
            max={100}
            value={t}
            onChange={(e) => setT(+e.target.value)}
            className="w-full accent-accent-cyan"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 mt-2 h-1 bg-line/40">
            {events.map((e) => (
              <div key={e.t} style={{ left: `${e.t}%` }} className="absolute top-0 h-2 w-[2px] bg-sev-elevated" />
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <Panel title="Compound Risk · Playback" subtitle={`t = ${scale.toFixed(2)}`}>
            <div className="mb-2 flex items-center gap-3">
              <span className="font-mono text-4xl font-bold tabular-nums text-sev-critical">{risk}</span>
              <StatusBadge severity={risk >= 75 ? "critical" : risk >= 55 ? "elevated" : risk >= 30 ? "watch" : "safe"} pulse />
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={riskHistory24h}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={[0, 100]} />
                  <ReferenceLine x={Math.floor(scale * (riskHistory24h.length - 1))} stroke="#00E5FF" strokeDasharray="2 2" />
                  <ReferenceLine y={75} stroke="#FF3B30" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="v" stroke="#FF3B30" dot={false} strokeWidth={1.5} />
                  <Tooltip contentStyle={{ background: "#0D0D10", border: "1px solid #27272A", borderRadius: 0, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Sensor Playback" subtitle="Synchronised to timeline">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {sensors.slice(0, 8).map((s) => {
                const idx = Math.floor(scale * (s.history.length - 1));
                const val = s.history[idx];
                const zone = zones.find(z => z.id === s.zoneId);
                return (
                  <div key={s.id} className="border border-line/70 bg-bg-s2/40 p-2.5">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-ink-lo">{zone?.code}</span>
                      <span className="text-ink-mid">{s.code}</span>
                    </div>
                    <div className="mt-1 font-mono text-lg text-ink-hi">
                      {val.toFixed(1)} <span className="text-[10px] text-ink-lo">{s.unit}</span>
                    </div>
                    <Sparkline data={s.history.slice(0, idx + 1)} width={140} height={26} color="#00E5FF" />
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-4">
          <Panel title="Event Log · Playback">
            <ol className="space-y-1.5 border-l border-line/60 pl-3">
              {events.map((e) => (
                <li key={e.t} className={`relative pl-2 ${t >= e.t ? "text-ink-hi" : "text-ink-lo"}`}>
                  <span className={`absolute -left-[15px] top-1.5 h-2 w-2 border ${
                    t >= e.t ? "bg-accent-cyan border-accent-cyan" : "border-ink-lo bg-bg-s2"
                  }`} />
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="font-mono text-[10px] w-10 text-ink-lo">T+{Math.round(e.t * 0.46)}m</span>
                    <span>{e.label}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}
