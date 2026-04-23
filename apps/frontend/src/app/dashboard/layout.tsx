import type { ReactNode } from "react";
import { DashboardNavShell } from "@/components/DashboardNavShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <DashboardNavShell />
      {children}
    </div>
  );
}
