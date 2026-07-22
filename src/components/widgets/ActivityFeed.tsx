"use client";
import { Panel } from "@/components/ui/Panel";
import { activityFeed } from "@/lib/mock";
import { RelTime } from "@/components/ui/RelTime";

export function ActivityFeed() {
  return (
    <Panel title="Activity" subtitle="System · Users · AI">
      <ol className="relative space-y-3 border-l border-line/70 pl-4">
        {activityFeed.map((a, i) => (
          <li key={i} className="relative">
            <span
              className={`absolute -left-[19px] top-1.5 h-2 w-2 border ${
                a.actor === "PRAAN AI"
                  ? "border-accent-cyan bg-accent-cyan/40"
                  : "border-ink-lo bg-bg-s2"
              }`}
            />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-ink-hi">
                <span
                  className={`font-mono text-xs ${
                    a.actor === "PRAAN AI" ? "text-accent-cyan" : "text-ink-mid"
                  }`}
                >
                  {a.actor}
                </span>{" "}
                {a.text}
              </span>
              <span className="whitespace-nowrap font-mono text-[10px] text-ink-lo">
                <RelTime ts={a.ts} />
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
