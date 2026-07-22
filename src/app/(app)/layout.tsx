import { AppShell } from "@/components/shell/AppShell";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
