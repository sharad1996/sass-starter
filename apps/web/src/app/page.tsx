import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-20">
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(62,232,181,0.22),_transparent_60%)]" />
        <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-muted)]">MERN stack starter</p>
        <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-[var(--color-ink)] md:text-6xl">
          Ship your SaaS with auth, roles, and billing hooks ready.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--color-muted)]">
          Next.js front-end, hardened Express API, MongoDB data layer, JWT access tokens with rotating refresh
          cookies, RBAC, Stripe-style webhooks mocked for local iteration, and CI that mirrors production.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-surface)] shadow-[0_0_40px_-12px_rgba(62,232,181,0.9)] transition hover:brightness-110"
          >
            Start building
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent-dim)]"
          >
            View sign in
          </Link>
        </div>
        <div className="mt-16 grid gap-6 border-t border-[var(--color-border)] pt-10 md:grid-cols-3">
          {[
            {
              title: "JWT + refresh rotation",
              body: "Short-lived access tokens with hashed refresh tokens stored in MongoDB and replay-safe rotation.",
            },
            {
              title: "RBAC out of the box",
              body: "Route guards for USER vs ADMIN, with list-users admin API and matching UI affordances.",
            },
            {
              title: "Stripe-shaped mock",
              body: "Checkout session URLs, mock completion, and signed webhooks to exercise your billing pipeline.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/70 p-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-ink)]">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
