"use client";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { BookOpen, MessageCircle, LifeBuoy, Mail } from "lucide-react";

const faqs = [
  { q: "What is a compound risk score?", a: "A composite score (0-100) computed from live sensor telemetry, active permits, worker positions, maintenance windows and weather. Individual signals may be safe while their combination is not." },
  { q: "Who receives critical alerts?", a: "By default: on-shift Safety Officers via SMS + in-app, Plant Manager via email. Configure under Settings → Notifications." },
  { q: "How is the AI lead-time computed?", a: "Precedent-search over 2 years of incidents, weighted by attribute similarity, then bounded by physics-informed constraints." },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-4">
      <div>
        <h1 className="font-black uppercase tracking-tight text-3xl">Help</h1>
        <p className="mt-1 text-sm text-ink-mid">Documentation, FAQs, and direct support.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Panel title="Documentation" actions={<BookOpen size={14} className="text-accent-cyan"/>}>
          <p className="text-sm text-ink-mid">Deployment guides, API references, and integration playbooks.</p>
          <Button variant="ghost" size="xs" className="mt-2">Open Docs →</Button>
        </Panel>
        <Panel title="Live Support" actions={<MessageCircle size={14} className="text-accent-cyan"/>}>
          <p className="text-sm text-ink-mid">Chat with a PRAAN engineer · 24/7 for critical clusters.</p>
          <Button variant="ghost" size="xs" className="mt-2">Start Chat →</Button>
        </Panel>
        <Panel title="Contact" actions={<Mail size={14} className="text-accent-cyan"/>}>
          <p className="text-sm text-ink-mid">support@praan.io · +91-79-4001-4001</p>
          <Button variant="ghost" size="xs" className="mt-2">Email Support →</Button>
        </Panel>
      </div>

      <Panel title="FAQ">
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f.q} className="border border-line/60 bg-bg-s2/40 p-3">
              <div className="text-sm text-ink-hi">{f.q}</div>
              <p className="mt-1 text-xs text-ink-mid">{f.a}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
