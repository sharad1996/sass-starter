"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ApiError, billingApi } from "@/lib/api";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/components/Providers";

const steps = [
  { n: 1, title: "Create session", body: "API returns a mock checkout URL with a session id." },
  { n: 2, title: "Parse redirect", body: "The client reads session_id from the success URL (no real redirect needed here)." },
  { n: 3, title: "Complete mock", body: "Marks the session complete and stamps a fake Stripe customer id on your user." },
];

function BillingContent() {
  const { auth } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lastCustomerId, setLastCustomerId] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    const accessToken = auth.accessToken;
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
      setLastCustomerId(completed.customerId);
      setMessage(`Mock subscription active. Customer ${completed.customerId}`);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Unable to run mock checkout");
    } finally {
      setPending(false);
    }
  }, [auth]);

  if (auth.status !== "authenticated") {
    return null;
  }

  return (
    <div className="space-y-8 pb-16">
      <header className="dashboard-reveal relative overflow-hidden rounded-3xl border border-[var(--color-border)] dashboard-mesh px-6 py-8 md:px-10 md:py-9">
        <div
          className="pointer-events-none absolute -left-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(62,232,181,0.28) 0%, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--color-accent)]">Billing lab</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--color-ink)] md:text-4xl">
              Mock checkout, real wiring patterns
            </h1>
            <p className="text-sm leading-relaxed text-[var(--color-muted)]">
              Exercise a Stripe-shaped API without keys: checkout session creation, success URL parsing, and a
              completion endpoint that persists a fake customer id—ideal for demos and CI.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 self-start rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent-dim)]/50 hover:text-[var(--color-ink)] md:self-end"
          >
            ← Back to overview
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="dashboard-reveal dashboard-reveal-delay-1 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">How the mock runs</h2>
          <ol className="space-y-0">
            {steps.map((step, i) => (
              <li key={step.n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent-dim)]/40 bg-[var(--color-accent)]/10 text-sm font-semibold text-[var(--color-accent)]">
                    {step.n}
                  </span>
                  {i < steps.length - 1 ? (
                    <span
                      className="my-1 min-h-[2rem] w-px flex-1 bg-gradient-to-b from-[var(--color-accent-dim)]/50 to-transparent"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className={i < steps.length - 1 ? "pb-8" : ""}>
                  <p className="font-medium text-[var(--color-ink)]">{step.title}</p>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/70 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Webhook shape</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              The API also exposes{" "}
              <code className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-accent)]">
                POST /v1/billing/webhook
              </code>{" "}
              with HMAC verification—mirror of how you would verify Stripe in production.
            </p>
          </div>
        </div>

        <aside className="dashboard-reveal dashboard-reveal-delay-2 flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/95 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-50 blur-2xl"
              style={{ background: "rgba(62,232,181,0.25)" }}
              aria-hidden
            />
            <div className="relative space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--color-muted)]">Demo line item</p>
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-ink)]">$49</span>
                <span className="text-sm text-[var(--color-muted)]">/ mo · mock</span>
              </div>
              <p className="text-sm text-[var(--color-muted)]">4900 cents in the API payload—adjust in code as you like.</p>
            </div>
            <ul className="relative mt-6 space-y-2.5 border-t border-[var(--color-border)]/80 pt-5 text-sm text-[var(--color-muted)]">
              <li className="flex gap-2">
                <CheckIcon />
                Checkout session + redirect URL
              </li>
              <li className="flex gap-2">
                <CheckIcon />
                Customer id persisted on user
              </li>
              <li className="flex gap-2">
                <CheckIcon />
                No external network required
              </li>
            </ul>
            <button
              type="button"
              disabled={pending}
              onClick={() => void startCheckout()}
              className="relative mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] py-3.5 text-sm font-semibold text-[var(--color-surface)] shadow-[0_0_32px_-8px_rgba(62,232,181,0.55)] transition enabled:hover:brightness-110 disabled:opacity-55"
            >
              {pending ? (
                <>
                  <Spinner />
                  Running mock flow…
                </>
              ) : (
                <>
                  <BoltIcon />
                  Run mock checkout
                </>
              )}
            </button>
            {message && (
              <p
                className={`mt-4 rounded-xl border px-3 py-2.5 text-sm leading-snug ${
                  message.includes("Unable") || message.includes("Missing") || message.includes("Validation")
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                    : "border-[var(--color-accent-dim)]/30 bg-[var(--color-accent)]/10 text-[var(--color-ink)]"
                }`}
                role="status"
              >
                {message}
              </p>
            )}
          </div>

          {lastCustomerId && (
            <div className="rounded-2xl border border-dashed border-[var(--color-accent-dim)]/35 bg-[var(--color-accent)]/[0.05] p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--color-muted)]">Last mock customer</p>
              <p className="mt-2 font-mono text-sm text-[var(--color-accent)]">{lastCustomerId}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-90" aria-hidden>
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function BillingPage() {
  return (
    <AuthGuard>
      <BillingContent />
    </AuthGuard>
  );
}
