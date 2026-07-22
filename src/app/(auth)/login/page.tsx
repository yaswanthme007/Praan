"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Lock, User, Fingerprint } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-lo">
          Sign in · Mission Control
        </div>
        <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-ink-hi">
          Enter the console
        </h2>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => router.push("/mfa"), 500);
        }}
        className="space-y-4"
      >
        <Field label="Email" icon={<User size={13}/>} type="email" defaultValue="priya.kapoor@praan.io" testid="login-email"/>
        <Field label="Password" icon={<Lock size={13}/>} type="password" defaultValue="mission-critical-2026" testid="login-password"/>

        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-ink-mid">
            <input type="checkbox" className="h-3 w-3 accent-accent-cyan"/>
            Remember this device
          </label>
          <Link href="/forgot" className="text-accent-cyan hover:underline">Forgot password?</Link>
        </div>

        <Button variant="primary" size="md" className="w-full justify-center" type="submit" data-testid="login-submit" disabled={loading}>
          {loading ? "Authenticating…" : "Sign In"}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-x-0 top-1/2 h-px bg-line"/>
          <div className="relative mx-auto w-fit bg-bg-base px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">or</div>
        </div>

        <button type="button" className="flex w-full items-center justify-center gap-2 border border-line bg-bg-s1 py-2.5 text-sm text-ink-mid hover:border-line-strong hover:text-ink-hi" data-testid="login-sso">
          <Fingerprint size={14}/> Continue with Single Sign-On
        </button>
      </form>

      <div className="mt-6 border-t border-line pt-4 text-center text-xs text-ink-lo">
        By continuing you agree to PRAAN’s Terms · SOC 2 audit trail is active.
      </div>
    </div>
  );
}

function Field({ label, icon, testid, ...rest }: any) {
  return (
    <label className="block">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">{label}</div>
      <div className="flex items-center gap-2 border border-line bg-bg-s1 px-3 py-2 focus-within:border-accent-cyan">
        <span className="text-ink-lo">{icon}</span>
        <input {...rest} data-testid={testid} className="w-full bg-transparent text-sm focus:outline-none"/>
      </div>
    </label>
  );
}
