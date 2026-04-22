# SaaS Starter (Next.js + Node + MongoDB)

Production-minded monorepo with a Next.js App Router client, Express API on Node 20+, MongoDB via Mongoose, JWT access tokens, rotating refresh tokens (httpOnly cookie + hashed storage), role-based access control, a Stripe-shaped mock for billing flows, and GitHub Actions CI.

## Structure

- `apps/web` — Next.js 15 front-end with session bootstrap, dashboard, billing lab, and admin directory UI.
- `apps/api` — Express API with helmet, CORS, rate limits, structured logging, and modular routers.

## Architecture

- **HTTP layer** (`routes/*`): maps HTTP to application services—parsing, cookies, and status codes stay here.
- **Application services** (`services/authApplication.service.ts`): owns session lifecycle rules, including refresh-token **reuse detection** (replay revokes every outstanding session for that user).
- **Persistence** (`repositories/*`, `models/*`): repositories wrap Mongoose so services stay testable and queries stay centralized.
- **Cross-cutting**: Pino logging with per-request `x-request-id`, redacted sensitive headers, `HttpError` mapping, and **Mongo transactions** when rotating refresh tokens.

## Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)

## Quick start

1. Start MongoDB (Docker example):

   ```bash
   docker compose up -d
   ```

2. Configure environment files:

   - Copy `apps/api/.env.example` to `apps/api/.env` and set secrets (minimum 32 characters for JWT secrets). `CORS_ORIGIN` is a comma-separated list—include both `http://localhost:PORT` and `http://127.0.0.1:PORT` if you use either hostname, or registration will fail in the browser.
   - Copy `apps/web/.env.example` to `apps/web/.env.local` and point `NEXT_PUBLIC_API_URL` at the API (default `http://localhost:4000`).

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   The API listens on port `4000` and the web app on `3000`.

## Authentication model

- **Access token**: short-lived JWT returned in JSON and kept in memory on the client for `Authorization` headers. The web client registers a recovery hook so one `TOKEN_INVALID` response triggers a refresh-cookie rotation and a single automatic retry.
- **Refresh token**: opaque token stored as an httpOnly cookie by the API, hashed at rest, rotated inside a Mongo transaction on every refresh, revocable on logout, and invalidated in bulk if a revoked token is replayed.

## Roles

- `USER` — default for self-serve registration.
- `ADMIN` — can list users via `GET /v1/users`.

Promote or create an admin:

```bash
cd apps/api
MONGODB_URI="mongodb://127.0.0.1:27017/saas" \
ADMIN_EMAIL="you@company.com" \
ADMIN_PASSWORD="your-secure-password" \
npx tsx src/scripts/seedAdmin.ts
```

## Stripe mock

- `POST /v1/billing/checkout-session` — authenticated; returns a mock session id and redirect URL.
- `POST /v1/billing/complete-mock` — marks a mock session complete and stamps a fake Stripe customer id on the user.
- `POST /v1/billing/webhook` — expects raw JSON and `stripe-signature` header equal to `HMAC-SHA256` of the body using `STRIPE_WEBHOOK_SECRET` (mirrors how you would verify Stripe test webhooks locally).

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Run API and web together             |
| `npm run build`| Build both workspaces                |
| `npm run lint` | ESLint across workspaces             |
| `npm run test` | API Vitest suite (integration runs when `CI=true` or `RUN_API_INTEGRATION=1` and MongoDB is reachable) |

## CI/CD

GitHub Actions workflow `.github/workflows/ci.yml` installs dependencies, runs lint, typecheck, API tests against a MongoDB service container, and builds both apps. Extend the same workflow with deploy jobs (Vercel, Fly.io, Render, ECS, etc.) when you are ready to ship.

## Security notes before production

- Rotate JWT secrets and Mongo credentials per environment.
- Serve the API over HTTPS, tighten CORS to your web origin, and prefer hosting the API behind the same site (reverse proxy) if you need first-party cookies without cross-origin complexity.
- Add observability (structured logs, metrics, tracing) and database backups appropriate to your SLA.
