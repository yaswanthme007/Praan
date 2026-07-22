"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-base p-6">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-30" />
      <div className="scanlines pointer-events-none absolute inset-0" />
      <div className="relative max-w-lg border border-line bg-bg-s1/70 p-8">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-sev-elevated" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-lo">Signal lost · 404</span>
        </div>
        <h1 className="mt-3 font-black uppercase tracking-tight text-4xl">Off the map</h1>
        <p className="mt-2 text-sm text-ink-mid">
          The zone you tried to reach isn’t part of this plant. Return to Mission Control to continue monitoring.
        </p>
        <Link href="/">
          <Button variant="primary" size="md" className="mt-6"><Home size={14}/>Back to Mission Control</Button>
        </Link>
      </div>
    </div>
  );
}
