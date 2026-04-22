"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, authApi } from "@/lib/api";
import { useAuth } from "@/components/providers";

export default function RegisterPage() {
  const { setSession } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const data = await authApi.register({ email, password, name });
      setSession(data.user, data.accessToken);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to register");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">Create your workspace</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">Password must be at least 10 characters.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 p-6 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.9)]">
        <label className="block text-sm text-[var(--color-muted)]">
          Name
          <input
            className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-ink)] outline-none ring-[var(--color-accent)]/40 focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-[var(--color-muted)]">
          Email
          <input
            className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-ink)] outline-none ring-[var(--color-accent)]/40 focus:ring-2"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-[var(--color-muted)]">
          Password
          <input
            className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-ink)] outline-none ring-[var(--color-accent)]/40 focus:ring-2"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={10}
            required
          />
        </label>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[var(--color-surface)] transition enabled:hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="text-center text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link className="text-[var(--color-accent)] hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}
