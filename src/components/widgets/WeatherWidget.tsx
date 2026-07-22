"use client";
import { Panel } from "@/components/ui/Panel";
import { weather } from "@/lib/mock";
import { Wind, Droplets, Eye, Gauge, Thermometer, AlertTriangle } from "lucide-react";

export function WeatherWidget() {
  return (
    <Panel title="Ambient · Site" subtitle={weather.condition}>
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={<Thermometer size={14} />} label="Temp" value={`${weather.temp}°C`} />
        <Metric icon={<Wind size={14} />} label="Wind" value={`${weather.wind}km/h ${weather.windDir}`} />
        <Metric icon={<Droplets size={14} />} label="Humidity" value={`${weather.humidity}%`} />
        <Metric icon={<Eye size={14} />} label="Visibility" value={weather.visibility} />
        <Metric icon={<Gauge size={14} />} label="Pressure" value={`${weather.pressure} hPa`} />
      </div>
      <div className="mt-3 flex items-start gap-2 border border-sev-elevated/40 bg-sev-elevated/5 px-2.5 py-2 text-xs">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-sev-elevated" />
        <span className="text-ink-mid">{weather.alert}</span>
      </div>
    </Panel>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border border-line/60 bg-bg-s2/40 px-2.5 py-2">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-lo">
        {icon}
        {label}
      </div>
      <div className="font-mono text-sm text-ink-hi">{value}</div>
    </div>
  );
}
