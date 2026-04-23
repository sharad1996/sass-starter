"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./Providers";
import type { UserRole } from "@/lib/types";
import { hasRole } from "@/lib/rbac";

function AccessDenied({ requiredRoles }: { requiredRoles: UserRole[] }) {
  const label = requiredRoles.length === 1 ? requiredRoles[0] : requiredRoles.join(" or ");
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-3xl border border-rose-500/25 bg-rose-500/[0.07] px-8 py-12 text-center"
    >
      <div className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-200/90">
        Access denied
      </div>
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">Insufficient permissions</h1>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          This page requires <span className="font-medium text-[var(--color-ink)]">{label}</span> access. Your account does
          not have the required role. If you were just promoted, refresh your session from the overview page.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-full bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] ring-1 ring-[var(--color-border)] transition hover:ring-[var(--color-accent-dim)]/50"
      >
        Back to overview
      </Link>
    </div>
  );
}

export function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "loading") return;
    if (auth.status === "anonymous") {
      router.replace("/login");
    }
  }, [auth.status, router]);

  if (auth.status !== "authenticated") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--color-muted)]">
        Checking session…
      </div>
    );
  }

  if (roles && !hasRole(auth.user.role, roles)) {
    return <AccessDenied requiredRoles={roles} />;
  }

  return <>{children}</>;
}
