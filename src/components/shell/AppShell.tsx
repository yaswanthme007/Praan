import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { EmergencyBanner } from "@/components/shell/EmergencyBanner";
import { Ticker } from "@/components/shell/Ticker";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-base">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <EmergencyBanner />
        <Ticker />
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
