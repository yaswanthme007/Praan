"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { initialAlerts } from "@/lib/mock";
import { RelTime } from "@/components/ui/RelTime";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { X } from "lucide-react";

export function NotificationDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          data-testid="notification-drawer"
          className="fixed right-0 top-0 z-50 h-full w-[92vw] max-w-md border-l border-line bg-bg-s1 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <Dialog.Title className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-mid">
              Notification Center
            </Dialog.Title>
            <button
              onClick={() => onOpenChange(false)}
              data-testid="close-notifications"
              className="text-ink-lo hover:text-ink-hi"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="divide-y divide-line/60 overflow-y-auto" style={{ maxHeight: "calc(100vh - 49px)" }}>
            {initialAlerts.map((a) => (
              <div key={a.id} className="p-4 hover:bg-bg-s2/60">
                <div className="mb-2 flex items-center justify-between">
                  <StatusBadge severity={a.severity} pulse={a.severity === "critical" && !a.ack} />
                  <span className="font-mono text-[10px] text-ink-lo"><RelTime ts={a.ts} /></span>
                </div>
                <div className="text-sm text-ink-hi">{a.title}</div>
                <div className="mt-0.5 text-xs text-ink-mid">{a.detail}</div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
