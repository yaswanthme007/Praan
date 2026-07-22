"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ShieldCheck } from "lucide-react";

export default function MFAPage() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  useEffect(() => refs.current[0]?.focus(), []);

  const set = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const full = code.join("");
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="text-accent-cyan"/>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-lo">Multi-Factor Verification</div>
          <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-ink-hi">Confirm identity</h2>
        </div>
      </div>
      <p className="mb-6 text-sm text-ink-mid">
        Enter the 6-digit code from your authenticator app.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/");
        }}
        className="space-y-4"
      >
        <div className="flex justify-between gap-2">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              inputMode="numeric"
              maxLength={1}
              value={c}
              data-testid={`mfa-digit-${i}`}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              className="h-14 w-12 border border-line bg-bg-s1 text-center text-2xl font-mono tabular-nums focus:border-accent-cyan focus:outline-none"
            />
          ))}
        </div>
        <Button
          variant="primary"
          size="md"
          type="submit"
          className="w-full justify-center"
          disabled={full.length !== 6}
          data-testid="mfa-submit"
        >
          Verify & Enter Mission Control
        </Button>
      </form>
      <div className="mt-6 flex justify-between text-xs">
        <Link href="/login" className="text-ink-lo hover:text-ink-hi">Use a different account</Link>
        <button className="text-accent-cyan hover:underline">Resend code</button>
      </div>
    </div>
  );
}
