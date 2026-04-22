"use client";

import Link from "next/link";
import { useAuth } from "./providers";

export function SiteHeader() {
  const { auth, logout } = useAuth();

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--color-ink)]">
          Orbit<span className="text-[var(--color-accent)]">.</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[var(--color-muted)]">
          {auth.status === "authenticated" ? (
            <>
              <Link className="transition hover:text-[var(--color-ink)]" href="/dashboard">
                Dashboard
              </Link>
              {auth.user.role === "ADMIN" && (
                <Link className="transition hover:text-[var(--color-ink)]" href="/dashboard/admin">
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-ink)] transition hover:border-[var(--color-accent-dim)] hover:text-[var(--color-accent)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="transition hover:text-[var(--color-ink)]" href="/login">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 font-medium text-[var(--color-surface)] transition hover:brightness-110"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
