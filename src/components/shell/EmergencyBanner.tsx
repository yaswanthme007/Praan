"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LiveClock } from "@/components/ui/LiveClock";

export function EmergencyBanner() {
  const [open, setOpen] = useState(true);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="emergency-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative overflow-hidden border-b border-sev-critical/40"
        >
          <div className="stripes-critical relative flex items-center gap-4 bg-sev-critical/10 px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-sev-critical animate-ping opacity-70" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-sev-critical" />
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-sev-critical">
                Compound Risk · CRITICAL · CR-014
              </span>
              <span className="text-ink-hi">
                Reactor Bay A — Hot Work + Rising HC + 4 workers inside. Lead time
                <span className="font-mono text-sev-critical"> ~12m</span>.
              </span>
              <LiveClock className="text-ink-mid" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/emergency"
                data-testid="banner-emergency-link"
                className="inline-flex h-7 items-center gap-1.5 border border-sev-critical bg-sev-critical/20 px-2.5 text-[11px] font-mono uppercase tracking-[0.2em] text-sev-critical hover:bg-sev-critical/30"
              >
                Open Command <ArrowRight size={12} />
              </Link>
              <button
                data-testid="banner-close"
                onClick={() => setOpen(false)}
                className="text-ink-lo hover:text-ink-hi"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
