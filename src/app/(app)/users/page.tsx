"use client";
import Image from "next/image";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { workers } from "@/lib/mock";
import { useState } from "react";
import { UserPlus, Shield, Key } from "lucide-react";

const roles = [
  { name: "System Admin", perms: 42, users: 3, desc: "Full access · manage roles, integrations, retention" },
  { name: "Plant Manager", perms: 28, users: 5, desc: "Cross-plant analytics · read-only permits & audit" },
  { name: "Safety Officer", perms: 22, users: 14, desc: "Acknowledge alerts · initiate response · edit permits" },
  { name: "Control Room Operator", perms: 18, users: 22, desc: "Read live telemetry · trigger SCADA safe-holds" },
  { name: "Response Team", perms: 14, users: 11, desc: "Emergency-only actions · muster reporting" },
  { name: "Contractor", perms: 6, users: 46, desc: "Time-boxed access via PTW linkage" },
];

export default function UsersPage() {
  const [tab, setTab] = useState<"users" | "roles" | "invite">("users");
  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-black uppercase tracking-tight text-3xl">User Management</h1>
          <p className="mt-1 text-sm text-ink-mid">Users · roles · permissions · invitations · activity.</p>
        </div>
        <Button variant="primary" onClick={()=>setTab("invite")} data-testid="invite-user-btn"><UserPlus size={12}/>Invite User</Button>
      </div>

      <div className="flex items-center gap-1 border-b border-line">
        {(["users", "roles", "invite"] as const).map((t) => (
          <button key={t} onClick={()=>setTab(t)} className={`h-9 px-3 font-mono text-[11px] uppercase tracking-[0.2em] ${tab === t ? "border-b-2 border-accent-cyan text-ink-hi" : "text-ink-lo hover:text-ink-hi"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <Panel title={`Users · ${workers.length}`}>
          <div className="-mx-4 -my-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line/60 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">MFA</th>
                  <th className="px-4 py-2">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w, i) => (
                  <tr key={w.id} className="border-b border-line/40 hover:bg-bg-s2/40">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Image src={w.avatar} alt={w.name} width={28} height={28} className="h-7 w-7 object-cover" unoptimized/>
                        <span className="text-ink-hi">{w.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-ink-mid">{w.role}</td>
                    <td className="px-4 py-2"><StatusBadge severity={w.status === "EMERGENCY" ? "critical" : w.status === "ACTIVE" ? "safe" : w.status === "BREAK" ? "watch" : "offline"} className="scale-90"/></td>
                    <td className="px-4 py-2 font-mono text-[11px] text-sev-safe">Enabled</td>
                    <td className="px-4 py-2 font-mono text-[11px] text-ink-lo">{i}m ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "roles" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <Panel key={r.name} title={r.name} subtitle={`${r.users} users · ${r.perms} permissions`}>
              <Shield size={16} className="text-accent-cyan"/>
              <p className="mt-2 text-xs text-ink-mid">{r.desc}</p>
              <Button variant="ghost" size="xs" className="mt-2">Manage</Button>
            </Panel>
          ))}
        </div>
      )}

      {tab === "invite" && (
        <Panel title="Invite User" subtitle="They receive an MFA-enrolment link">
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e)=>e.preventDefault()}>
            <Field label="Full name" placeholder="Jane Doe" />
            <Field label="Email" type="email" placeholder="jane@praan.io"/>
            <Field label="Role" placeholder="Safety Officer"/>
            <Field label="Plant" placeholder="IN-JMN-01"/>
            <div className="sm:col-span-2 flex items-center gap-2">
              <Button variant="primary" data-testid="invite-submit"><Key size={12}/>Send Invite</Button>
              <Button variant="ghost" type="button">Cancel</Button>
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
function Field({label, ...props}: any){
  return (<label className="block"><div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-lo">{label}</div><input {...props} className="w-full border border-line bg-bg-base px-3 py-2 text-sm focus:border-accent-cyan focus:outline-none"/></label>);
}
