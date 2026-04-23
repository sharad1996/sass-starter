"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdminRole } from "@/lib/rbac";
import type { UserRole } from "@/lib/types";

const allTabs = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/admin", label: "Admin", requiresAdmin: true },
] as const;

export type DashboardNavProps = {
  /** When set (e.g. in unit tests), overrides `usePathname()`. */
  pathnameOverride?: string;
  /**
   * Controls visibility of the Admin tab. While `loading`, Admin is hidden so non-admins never see a dead link.
   */
  viewerRole?: UserRole | null | "loading";
};

export function DashboardNav({ pathnameOverride, viewerRole = "loading" }: DashboardNavProps) {
  const pathnameFromHook = usePathname();
  const pathname = pathnameOverride ?? pathnameFromHook;

  const tabs = allTabs.filter((tab) => {
    if (!("requiresAdmin" in tab) || !tab.requiresAdmin) return true;
    return viewerRole !== "loading" && viewerRole !== null && isAdminRole(viewerRole);
  });

  return (
    <nav className="mb-8 flex flex-wrap gap-3" aria-label="Dashboard">
      {tabs.map(({ href, label }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-full border border-[var(--color-accent-dim)] bg-[var(--color-accent)]/15 px-3 py-1 text-sm font-medium text-[var(--color-accent)]"
                : "rounded-full border border-transparent px-3 py-1 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-border)] hover:text-[var(--color-ink)]"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
