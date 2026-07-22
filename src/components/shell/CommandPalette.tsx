"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, BarChart3, Bell, BookOpen, Building2, ClipboardCheck, Cog, FileText, Map, Radar, Radio, Rewind, Search, ShieldAlert, Signal, Sparkles, Users, Wrench, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; group: string; icon: any; hint?: string };

const items: Item[] = [
  { href: "/", label: "Executive Overview", group: "Navigate", icon: BarChart3 },
  { href: "/live", label: "Live Monitoring", group: "Navigate", icon: Radar },
  { href: "/map", label: "Digital Plant Map", group: "Navigate", icon: Map },
  { href: "/risk", label: "Compound Risk Center", group: "Navigate", icon: ShieldAlert },
  { href: "/alerts", label: "Alert Center", group: "Navigate", icon: AlertTriangle },
  { href: "/incidents", label: "Incident Center", group: "Navigate", icon: AlertOctagon },
  { href: "/emergency", label: "Emergency Command", group: "Navigate", icon: Radio },
  { href: "/replay", label: "Incident Replay", group: "Navigate", icon: Rewind },
  { href: "/sensors", label: "Sensors", group: "Navigate", icon: Signal },
  { href: "/workers", label: "Workers", group: "Navigate", icon: Users },
  { href: "/maintenance", label: "Maintenance", group: "Navigate", icon: Wrench },
  { href: "/permits", label: "Permit-to-Work", group: "Navigate", icon: ClipboardCheck },
  { href: "/rules", label: "Rule Library", group: "Navigate", icon: BookOpen },
  { href: "/ai", label: "AI Insights", group: "Navigate", icon: Sparkles },
  { href: "/reports", label: "Reports", group: "Navigate", icon: FileText },
  { href: "/plants", label: "Plants", group: "Navigate", icon: Building2 },
  { href: "/notifications", label: "Notifications", group: "Navigate", icon: Bell },
  { href: "/settings", label: "Settings", group: "Navigate", icon: Cog },

  { href: "/emergency", label: "Trigger evacuation drill", group: "Actions", icon: Radio, hint: "Emergency" },
  { href: "/alerts", label: "Acknowledge all alerts", group: "Actions", icon: AlertTriangle, hint: "Alerts" },
  { href: "/replay", label: "Replay last incident", group: "Actions", icon: Rewind, hint: "Replay" },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const filtered = q
      ? items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
      : items;
    const grouped: Record<string, Item[]> = {};
    filtered.forEach((i) => {
      grouped[i.group] = grouped[i.group] || [];
      grouped[i.group].push(i);
    });
    return grouped;
  }, [q]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          data-testid="command-palette"
          className="fixed left-1/2 top-[15%] z-50 w-[90vw] max-w-2xl -translate-x-1/2 border border-line bg-bg-s1 shadow-2xl"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Search size={16} className="text-ink-lo" />
            <input
              autoFocus
              data-testid="command-palette-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search anything — Cmd+K"
              className="flex-1 bg-transparent text-sm text-ink-hi placeholder:text-ink-lo focus:outline-none"
            />
            <kbd className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-lo">
              ESC
            </kbd>
          </div>
          <div className="max-h-[50vh] overflow-y-auto py-2">
            {Object.entries(results).map(([grp, arr]) => (
              <div key={grp} className="mb-2">
                <div className="px-4 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-lo">
                  {grp}
                </div>
                {arr.map((it) => {
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.href + it.label}
                      data-testid={`cmd-${it.label.replace(/\s/g, "-").toLowerCase()}`}
                      onClick={() => {
                        router.push(it.href);
                        onOpenChange(false);
                      }}
                      className={cn(
                        "group flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-ink-mid",
                        "hover:bg-bg-s2 hover:text-ink-hi"
                      )}
                    >
                      <Icon size={14} className="text-ink-lo group-hover:text-accent-cyan" />
                      <span className="flex-1">{it.label}</span>
                      {it.hint && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">
                          {it.hint}
                        </span>
                      )}
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            ))}
            {Object.keys(results).length === 0 && (
              <div className="py-10 text-center text-sm text-ink-lo">
                No matches. Try “risk”, “alert”, “worker”…
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
