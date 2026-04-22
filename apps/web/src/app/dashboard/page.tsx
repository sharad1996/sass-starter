"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/providers";

function DashboardContent() {
  const { auth } = useAuth();
  if (auth.status !== "authenticated") return null;
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">Overview</h1>
        <p className="mt-2 text-[var(--color-muted)]">Signed in as {auth.user.email}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Role</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">{auth.user.role}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            ADMIN unlocks the user directory. Seed an admin with the API script documented in the README.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Session</p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Access token is kept in memory on this device. Refresh tokens are httpOnly cookies issued by the API.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
