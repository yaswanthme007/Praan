"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-lo">Reset · Access Recovery</div>
        <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-ink-hi">Forgot password</h2>
        <p className="mt-1 text-sm text-ink-mid">We’ll send a signed reset link to your registered email.</p>
      </div>

      {sent ? (
        <div className="border border-sev-safe/40 bg-sev-safe/5 p-4 text-sm text-ink-hi">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-sev-safe">Sent</div>
          <div className="mt-1">Check your inbox for a reset link valid for 15 minutes.</div>
        </div>
      ) : (
        <form onSubmit={(e)=>{e.preventDefault();setSent(true);}} className="space-y-4">
          <label className="block">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">Email</div>
            <div className="flex items-center gap-2 border border-line bg-bg-s1 px-3 py-2 focus-within:border-accent-cyan">
              <Mail size={13} className="text-ink-lo"/>
              <input type="email" placeholder="you@praan.io" data-testid="forgot-email" className="w-full bg-transparent text-sm focus:outline-none"/>
            </div>
          </label>
          <Button variant="primary" size="md" className="w-full justify-center" type="submit" data-testid="forgot-submit">Send reset link</Button>
        </form>
      )}

      <div className="mt-6 text-center text-xs">
        <Link href="/login" className="text-accent-cyan hover:underline">← Back to sign in</Link>
      </div>
    </div>
  );
}
