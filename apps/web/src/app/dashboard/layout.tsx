import type { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const linkClass =
    "rounded-full border border-transparent px-3 py-1 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-border)] hover:text-[var(--color-ink)]";
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap gap-3">
        <Link className={linkClass} href="/dashboard">
          Overview
        </Link>
        <Link className={linkClass} href="/dashboard/billing">
          Billing
        </Link>
        <Link className={linkClass} href="/dashboard/admin">
          Admin
        </Link>
      </div>
      {children}
    </div>
  );
}
