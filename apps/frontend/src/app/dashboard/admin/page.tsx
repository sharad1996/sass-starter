"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, usersApi } from "@/lib/api";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/Providers";
import { ADMIN_ROLES } from "@/lib/rbac";

function AdminContent() {
  const { auth, refreshSession } = useAuth();
  const [rows, setRows] = useState<Array<{ id: string; email: string; name: string; role: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    const token = auth.accessToken;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setForbidden(false);
    void (async () => {
      try {
        const data = await usersApi.list(token);
        if (!cancelled) {
          setRows(data.users);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.code === "FORBIDDEN") {
            setForbidden(true);
            setError(
              "Your access token does not include admin permissions yet. Refresh your session, or sign out and sign back in so a new token picks up your role from the database."
            );
          } else {
            setError(err instanceof ApiError ? err.message : "Unable to load users");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  if (auth.status !== "authenticated") {
    return null;
  }

  return (
    <section className="min-h-[50vh] space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">Admin directory</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Lists workspace members via <code className="text-[var(--color-accent)]">GET /v1/users</code> — API
          enforces <span className="font-medium text-[var(--color-ink)]">ADMIN</span> only.
        </p>
      </div>
      {error && (
        <div className="space-y-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-100">
          <p>{error}</p>
          {forbidden && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={refreshing}
                onClick={() => {
                  setRefreshing(true);
                  void (async () => {
                    try {
                      await refreshSession();
                    } finally {
                      setRefreshing(false);
                    }
                  })();
                }}
                className="rounded-full bg-[var(--color-surface)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] ring-1 ring-[var(--color-border)] transition enabled:hover:ring-[var(--color-accent-dim)]/50 disabled:opacity-50"
              >
                {refreshing ? "Refreshing…" : "Refresh session"}
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-medium text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-ink)] hover:underline"
              >
                Overview
              </Link>
            </div>
          )}
        </div>
      )}
      {loading ? (
        <p className="text-sm text-[var(--color-muted)]">Loading directory…</p>
      ) : (
        !error && (
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/80">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--color-surface)]/60 text-[var(--color-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
                      No users returned.
                    </td>
                  </tr>
                ) : (
                  rows.map((u) => (
                    <tr key={u.id} className="border-t border-[var(--color-border)]">
                      <td className="px-4 py-3 text-[var(--color-ink)]">{u.name}</td>
                      <td className="px-4 py-3 text-[var(--color-muted)]">{u.email}</td>
                      <td className="px-4 py-3 text-[var(--color-accent)]">{u.role}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard roles={ADMIN_ROLES}>
      <AdminContent />
    </AuthGuard>
  );
}
