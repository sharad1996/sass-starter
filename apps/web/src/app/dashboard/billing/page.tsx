"use client";

import { useState } from "react";
import { ApiError, billingApi } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/providers";

function BillingContent() {
  const { auth } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (auth.status !== "authenticated") return null;
  const accessToken = auth.accessToken;

  async function startCheckout() {
    setMessage(null);
    setPending(true);
    try {
      const origin = window.location.origin;
      const session = await billingApi.checkout(accessToken, {
        successUrl: `${origin}/dashboard/billing`,
        cancelUrl: `${origin}/dashboard/billing`,
        amount: 4900,
      });
      const url = new URL(session.url);
      const sid = url.searchParams.get("session_id");
      if (!sid) {
        setMessage("Mock checkout missing session id");
        return;
      }
      const completed = await billingApi.completeMock(accessToken, sid);
      setMessage(`Mock subscription active. Customer ${completed.customerId}`);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Unable to run mock checkout");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">Billing lab</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          This flow exercises the mock Stripe checkout session, success redirect parsing, and customer ID persistence
          without leaving your machine.
        </p>
      </div>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 p-6">
        <button
          type="button"
          disabled={pending}
          onClick={() => void startCheckout()}
          className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-surface)] transition enabled:hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Running mock…" : "Run mock checkout"}
        </button>
        {message && <p className="mt-4 text-sm text-[var(--color-ink)]">{message}</p>}
      </div>
    </section>
  );
}

export default function BillingPage() {
  return (
    <AuthGuard>
      <BillingContent />
    </AuthGuard>
  );
}
