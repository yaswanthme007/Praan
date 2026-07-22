import { Chivo, JetBrains_Mono } from "next/font/google";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-fine opacity-40" />
        <div className="scanlines absolute inset-0 opacity-40" />
        <div className="absolute -left-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-sev-critical/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left: brand marketing panel */}
        <div className="hidden flex-1 flex-col justify-between border-r border-line bg-bg-s1/40 p-12 lg:flex">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 32 32" className="h-9 w-9">
              <rect x="1" y="1" width="30" height="30" fill="none" stroke="#00E5FF" strokeWidth="1.5" />
              <path d="M6 24 L6 8 L16 8 L21 12 L16 16 L11 16 L11 24 Z" fill="none" stroke="#F4F4F5" strokeWidth="1.6" />
              <circle cx="24" cy="22" r="3" fill="#FF3B30" />
            </svg>
            <div>
              <div className="text-2xl font-black tracking-[0.28em] text-ink-hi">PRAAN</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-lo">Industrial Safety Intelligence</div>
            </div>
          </div>
          <div>
            <h1 className="max-w-md text-4xl font-black uppercase leading-tight tracking-tight text-ink-hi">
              See dangerous combinations
              <br/><span className="text-accent-cyan">before they happen.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm text-ink-mid">
              PRAAN unifies your gas sensors, IoT devices, SCADA, permits, worker tracking and
              maintenance into a live Compound Risk Score. Individual sensors miss the pattern —
              we catch it.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6">
              <Stat n="< 12m" l="Median lead time" />
              <Stat n="98.6%" l="Precision on precursors" />
              <Stat n="0" l="LTIs since Jan-2025" />
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-lo">
            v2026.01 · SOC 2 Type II · IEC 61511 SIL-2
          </div>
        </div>

        {/* Right: form */}
        <div className="flex flex-1 items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-mono text-2xl font-bold text-accent-cyan tabular-nums">{n}</div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">{l}</div>
    </div>
  );
}
