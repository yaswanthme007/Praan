"use client";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Sparkles, Send, Lightbulb, Brain } from "lucide-react";
import { useState } from "react";
import { compoundRules } from "@/lib/mock";

const insights = [
  {
    id: "in1",
    title: "Reactor Bay A is entering a rare combined-hazard window",
    body: "PRAAN detected a combination not present in the last 180 days: rising HC (2.3ppm/min) + active Hot Work + 4 workers + wind-into-zone. Similar patterns escalated in an average of 14 minutes.",
    tone: "critical",
  },
  {
    id: "in2",
    title: "Compressor C-2 vibration signature matches early-stage bearing failure",
    body: "Waveform correlation with historical bearing failures @ 0.87. Recommend inspection at next maintenance window (WO-8803 completing in 18m).",
    tone: "elevated",
  },
  {
    id: "in3",
    title: "Tank T-11 level sensor drifting outside ±3% band",
    body: "Trend over the last 4h suggests calibration drift, not tank event. Recommend recalibration during scheduled downtime.",
    tone: "watch",
  },
];

export default function AIInsightsPage() {
  const [q, setQ] = useState("");
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl flex items-center gap-2">
            <Sparkles className="text-accent-cyan"/> AI Insights
          </h1>
          <p className="mt-1 text-sm text-ink-mid">Ask PRAAN. Or scan what it has learned about your plant today.</p>
        </div>
      </div>

      <Panel title="Ask PRAAN" subtitle="Grounded in your plant’s live data & 2 years of incidents">
        <form
          onSubmit={(e)=>{e.preventDefault();}}
          className="flex items-center gap-2 border border-line bg-bg-base px-3 py-2"
        >
          <Brain size={14} className="text-accent-cyan"/>
          <input
            data-testid="ai-ask-input"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="e.g. Why did compound risk spike in Reactor Bay A at 14:20?"
            className="w-full bg-transparent text-sm text-ink-hi placeholder:text-ink-lo focus:outline-none"
          />
          <Button variant="primary" size="sm" type="submit" data-testid="ai-ask-btn">
            <Send size={12}/>Ask
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            "Which zones will most likely alert in the next 30m?",
            "Explain CR-014 to a new hire",
            "What if I halt PTW-2041?",
            "Compare today's risk to last Tuesday",
          ].map((s) => (
            <button key={s} onClick={()=>setQ(s)} className="border border-line px-2 py-1 font-mono text-[10px] text-ink-mid hover:text-ink-hi hover:border-line-strong">
              {s}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {insights.map((i) => (
          <Panel key={i.id} title={i.tone === "critical" ? "Prediction · Critical" : i.tone === "elevated" ? "Prediction · Elevated" : "Prediction · Watch"} accent={i.tone as any}>
            <div className="flex items-center gap-2 text-xs">
              <Lightbulb size={12} className={
                i.tone === "critical" ? "text-sev-critical" :
                i.tone === "elevated" ? "text-sev-elevated" : "text-sev-watch"
              }/>
              <StatusBadge severity={i.tone as any} />
            </div>
            <div className="mt-2 text-sm text-ink-hi">{i.title}</div>
            <p className="mt-1 text-xs text-ink-mid">{i.body}</p>
          </Panel>
        ))}
      </div>

      <Panel title="Top Contributing Rules · This Week">
        <ul className="grid gap-1 md:grid-cols-2">
          {compoundRules.map((r) => (
            <li key={r.id} className="flex items-center justify-between border border-line/60 bg-bg-s2/40 p-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-ink-lo">{r.code}</span>
                <span className="text-ink-hi">{r.name}</span>
              </div>
              <StatusBadge severity={r.severity} className="scale-90"/>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
