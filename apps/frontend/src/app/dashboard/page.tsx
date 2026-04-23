"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/Providers";
import { isAdminRole } from "@/lib/rbac";

function initials(name: string, email: string) {
  const t = name.trim();
  if (t.length >= 2) return t.slice(0, 2).toUpperCase();
  const e = email.split("@")[0] ?? "?";
  return e.slice(0, 2).toUpperCase();
}

function DashboardContent() {
  const { auth } = useAuth();
  if (auth.status !== "authenticated") {
    return null;
  }
  const { user } = auth;
  const isAdmin = isAdminRole(user.role);

  return (
    <div className="space-y-8 pb-16">
      <header className="dashboard-reveal relative overflow-hidden rounded-3xl border border-[var(--color-border)] dashboard-mesh px-6 py-8 md:px-10 md:py-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(62,232,181,0.35) 0%, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--color-accent)]">Workspace</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--color-ink)] md:text-4xl">
              Welcome back
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
              This starter wires auth, roles, and a Stripe-shaped mock so you can demo flows without wiring production
              billing yet.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)]/80 bg-[var(--color-surface)]/40 px-4 py-3 backdrop-blur-sm">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-accent-dim)]/50 bg-[var(--color-accent)]/10 text-sm font-semibold tracking-tight text-[var(--color-accent)]"
              aria-hidden
            >
              {initials(user.name, user.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-[var(--color-ink)]">{user.name}</p>
              <p className="truncate text-sm text-[var(--color-muted)]">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="Workspace snapshot" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="dashboard-reveal dashboard-reveal-delay-1 group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-[var(--color-accent-dim)]/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-muted)]">Role</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">{user.role}</p>
            </div>
            <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-2 text-[var(--color-accent)]" aria-hidden>
              <ShieldIcon />
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
            {isAdmin
              ? "You can open the Admin directory and list workspace members from the API."
              : "Promote this account with the seed script to unlock the admin directory and user listing."}
          </p>
        </article>

        <article className="dashboard-reveal dashboard-reveal-delay-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-muted)]">Session</p>
              <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">JWT + rotating refresh</p>
            </div>
            <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-2 text-[var(--color-accent)]" aria-hidden>
              <KeyIcon />
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
              Access token stays in memory for API calls.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-dim)]" aria-hidden />
              Refresh token is httpOnly; replay-safe rotation on the API.
            </li>
          </ul>
        </article>

        <article className="dashboard-reveal dashboard-reveal-delay-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-muted)]">Demo shortcuts</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/dashboard/billing"
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-3 py-2.5 text-sm text-[var(--color-ink)] transition hover:border-[var(--color-accent-dim)]/50 hover:bg-[var(--color-surface)]/80"
            >
              <span className="flex items-center gap-2">
                <span className="text-[var(--color-accent)]" aria-hidden>
                  <CardIcon />
                </span>
                Billing lab
              </span>
              <ChevronIcon />
            </Link>
            {isAdmin ? (
              <Link
                href="/dashboard/admin"
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-3 py-2.5 text-sm text-[var(--color-ink)] transition hover:border-[var(--color-accent-dim)]/50 hover:bg-[var(--color-surface)]/80"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]" aria-hidden>
                    <UsersIcon />
                  </span>
                  Admin directory
                </span>
                <ChevronIcon />
              </Link>
            ) : (
              <span
                className="flex cursor-not-allowed items-center justify-between gap-3 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30 px-3 py-2.5 text-sm text-[var(--color-muted)]"
                title="Requires ADMIN role — use the seed script in the README"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[var(--color-muted)]" aria-hidden>
                    <UsersIcon />
                  </span>
                  Admin directory
                </span>
                <LockIcon />
              </span>
            )}
          </div>
        </article>

        <article className="dashboard-reveal dashboard-reveal-delay-4 flex flex-col justify-between rounded-2xl border border-dashed border-[var(--color-accent-dim)]/35 bg-[var(--color-accent)]/[0.06] p-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-muted)]">Starter kit</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              Next.js App Router, Express API, MongoDB, JWT access + hashed refresh tokens, RBAC, and mock Stripe flows.
            </p>
          </div>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-[var(--color-accent)]/90">
            apps/frontend · apps/backend
          </p>
        </article>
      </section>

      <section
        aria-label="Illustrative metrics"
        className="dashboard-reveal dashboard-reveal-delay-2 grid gap-3 sm:grid-cols-3"
      >
        {[
          { label: "Auth model", value: "Cookie + Bearer", hint: "Same-origin proxy friendly" },
          { label: "Demo tier", value: "Orbit Starter", hint: "Mock data & flows only" },
          { label: "Security posture", value: "Helmet + CORS", hint: "Rate limits on auth routes" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex flex-col justify-center rounded-xl border border-[var(--color-border)]/80 bg-[var(--color-surface-2)]/60 px-4 py-4"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--color-muted)]">{row.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)]">{row.value}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{row.hint}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6M15.5 7.5 18 10" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50" aria-hidden>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
