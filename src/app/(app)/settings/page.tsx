"use client";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useState } from "react";
import { Bell, Monitor, Lock, Palette, Cog, Globe, Radio } from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: Cog },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "prefs", label: "Preferences", icon: Monitor },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  return (
    <div className="mx-auto max-w-[1200px] space-y-4">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl">System Settings</h1>
        <p className="mt-1 text-sm text-ink-mid">Per-user & per-plant configuration.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <nav className="lg:col-span-3">
          <ul className="border border-line bg-bg-s1/70">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.id}>
                  <button
                    data-testid={`settings-tab-${t.id}`}
                    onClick={()=>setTab(t.id)}
                    className={`flex w-full items-center gap-2 border-l-2 px-3 py-2.5 text-left text-sm ${tab === t.id ? "border-accent-cyan bg-bg-s2 text-ink-hi" : "border-transparent text-ink-mid hover:text-ink-hi"}`}
                  >
                    <Icon size={14}/> {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-3 lg:col-span-9">
          {tab === "general" && (
            <Panel title="General">
              <Row label="Facility name" value="Jamnagar Refinery Cluster" />
              <Row label="Facility code" value="IN-JMN-01" />
              <Row label="Region" value="APAC · India" />
              <Row label="Timezone" value="UTC · displayed" />
              <Row label="Locale" value="en-IN" />
            </Panel>
          )}
          {tab === "notifications" && (
            <Panel title="Notification Rules">
              <ToggleRow label="Critical Compound Risk · SMS" defaultChecked />
              <ToggleRow label="Elevated Risk · In-App" defaultChecked />
              <ToggleRow label="Watch Risk · Email digest" />
              <ToggleRow label="Permit expiring in 60m" defaultChecked />
              <ToggleRow label="Maintenance overdue" defaultChecked />
              <ToggleRow label="Weekly digest email" defaultChecked />
            </Panel>
          )}
          {tab === "security" && (
            <Panel title="Security">
              <ToggleRow label="Require MFA on login" defaultChecked />
              <ToggleRow label="Sign-out on tab close" />
              <ToggleRow label="Enable IP allow-list" />
              <ToggleRow label="Session recording (audit)" defaultChecked />
              <Row label="Session TTL" value="12h" />
            </Panel>
          )}
          {tab === "theme" && (
            <Panel title="Theme">
              <div className="grid grid-cols-3 gap-2">
                {[["Mission Control · Dark", "border-accent-cyan bg-bg-s1", true],["Amber Console","border-line bg-bg-s1", false],["High-Contrast","border-line bg-bg-s1", false]].map(([n, c, sel]:any)=>(
                  <button key={n} className={`border p-4 text-left ${c} ${sel ? "ring-2 ring-accent-cyan" : ""}`}>
                    <div className="mb-3 flex gap-1">
                      <span className="h-6 w-6 bg-accent-cyan"/><span className="h-6 w-6 bg-sev-elevated"/><span className="h-6 w-6 bg-sev-critical"/>
                    </div>
                    <div className="text-sm text-ink-hi">{n}</div>
                    {sel && <div className="mt-1 font-mono text-[10px] text-accent-cyan">SELECTED</div>}
                  </button>
                ))}
              </div>
            </Panel>
          )}
          {tab === "prefs" && (
            <Panel title="Preferences">
              <ToggleRow label="Dense layout" defaultChecked />
              <ToggleRow label="Sound on critical alert" defaultChecked />
              <ToggleRow label="Show tabular numerics" defaultChecked />
              <ToggleRow label="Auto-scrub replay to critical events" />
              <Row label="Language" value="English" />
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
function Row({label, value}:{label:string;value:string}) {
  return <div className="flex items-center justify-between border-b border-line/40 py-2.5 last:border-0"><span className="text-sm text-ink-mid">{label}</span><span className="font-mono text-sm text-ink-hi">{value}</span></div>;
}
function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [v, setV] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between border-b border-line/40 py-2.5 last:border-0">
      <span className="text-sm text-ink-mid">{label}</span>
      <Switch checked={v} onCheckedChange={setV} />
    </div>
  );
}
