"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";

export default function ResetPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-lo">Reset · New Passphrase</div>
        <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-ink-hi">Reset password</h2>
      </div>
      <form onSubmit={(e)=>e.preventDefault()} className="space-y-4">
        <Field label="New password" testid="reset-new"/>
        <Field label="Confirm password" testid="reset-confirm"/>
        <div className="border border-line/60 bg-bg-s2/40 p-3 font-mono text-[10px] text-ink-mid">
          <div className="text-ink-hi">Requirements</div>
          <ul className="mt-1 space-y-0.5 text-ink-lo">
            <li>· Minimum 16 characters</li>
            <li>· Mix of upper, lower, digit and symbol</li>
            <li>· Cannot be a previously used password</li>
          </ul>
        </div>
        <Button variant="primary" size="md" className="w-full justify-center" data-testid="reset-submit">Update password</Button>
      </form>
      <div className="mt-6 text-center text-xs">
        <Link href="/login" className="text-accent-cyan hover:underline">← Back to sign in</Link>
      </div>
    </div>
  );
}
function Field({label, testid}:any){
  return (<label className="block"><div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">{label}</div><div className="flex items-center gap-2 border border-line bg-bg-s1 px-3 py-2 focus-within:border-accent-cyan"><Lock size={13} className="text-ink-lo"/><input type="password" data-testid={testid} className="w-full bg-transparent text-sm focus:outline-none"/></div></label>);
}
