"use client";

import { useEffect, useState } from "react";
import { ApiError, usersApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/providers";

function AdminContent() {
  const { auth } = useAuth();
  const [rows, setRows] = useState<Array<{ id: string; email: string; name: string; role: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    const token = auth.accessToken;
    void (async () => {
      try {
        const data = await usersApi.list(token);
        setRows(data.users);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Unable to load users");
      }
    })();
  }, [auth]);

  if (auth.status !== "authenticated") return null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">Admin directory</h1>
        <p className="mt-2 text-[var(--color-muted)]">Requires ADMIN role on your account.</p>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
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
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 text-[var(--color-ink)]">{u.name}</td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{u.email}</td>
                <td className="px-4 py-3 text-[var(--color-accent)]">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard roles={["ADMIN"]}>
      <AdminContent />
    </AuthGuard>
  );
}
