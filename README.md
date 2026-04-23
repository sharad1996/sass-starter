# SaaS Starter

**Author:** sharad kumar  

A production-minded **SaaS boilerplate**: sign up, sign in, role-based access, mock billing, and CI so you can focus on product features instead of wiring the same foundations again.

---

## Tech stack

| Layer | Technology |
| ----- | ---------- |
| **Frontend** | [Next.js](https://nextjs.org/) 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | [Node.js](https://nodejs.org/) 20+, [Express](https://expressjs.com/) 4, TypeScript |
| **Database** | [MongoDB](https://www.mongodb.com/) 7+ with [Mongoose](https://mongoosejs.com/) 8 |
| **Auth** | JWT access tokens, opaque **refresh** tokens (http-only cookie), rotation + reuse detection, bcrypt password hashing |
| **Validation** | [Zod](https://zod.dev/) |
| **Logging** | [Pino](https://getpino.io/) with request correlation (`x-request-id`) |
| **Billing (dev)** | Stripe-shaped **mock** (checkout session, completion, signed webhooks) |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions) — install, lint, typecheck, tests, build |

---

## What you get

- **Auth**: Register, login, logout, refresh, `/me` with layered **routes → application services → repositories**.
- **RBAC**: `USER` and `ADMIN`; admin-only user listing.
- **Same-origin API in dev**: Next **rewrites** `/api/v1/*` to the Express server so cookies match your browser host (`localhost` vs `127.0.0.1`).
- **Hardening**: Helmet, CORS (comma-separated allowlist), rate limits, structured errors.

---

## Monorepo layout

| Path | Role |
| ---- | ---- |
| `apps/frontend` | Next.js UI (npm package `@saas/web`) |
| `apps/backend` | Express API (npm package `@saas/api`) |
| `.github/workflows` | CI pipeline |

---

## Prerequisites

- **Node.js** 20 or newer  
- **MongoDB** 7+ (local instance, Docker, or Atlas)

---

## Quick start

### 1. Start MongoDB (optional local example)

```bash
docker compose up -d
```

### 2. Environment variables

**Backend** — copy `apps/backend/.env.example` → `apps/backend/.env` and set:

- `MONGODB_URI` — connection string  
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — each **at least 32 characters**  
- `CORS_ORIGIN` — comma-separated list of origins your **Next** app uses (e.g. `http://localhost:3000`, `http://127.0.0.1:3000`, and alternate ports if Next picks them)

**Frontend** — copy `apps/frontend/.env.example` → `apps/frontend/.env.local`:

- **Recommended:** set `INTERNAL_API_URL` (e.g. `http://127.0.0.1:4000`) and **leave `NEXT_PUBLIC_API_URL` unset** so the browser calls same-origin `/api/v1/...` (rewrites in `apps/frontend/next.config.ts`).  
- **Optional:** set `NEXT_PUBLIC_API_URL` to call the API directly (then align hostnames with cookie / CORS rules).

See the repo root `.env.example` for a combined reference.

### 3. Install and run

From the **repository root**:

```bash
npm install
npm run dev
```

- **API** (default): `http://localhost:4000`  
- **Web** (default): `http://127.0.0.1:3000` (Next may use another port if `3000` is busy — watch the terminal output)

---

## Architecture (backend)

- **HTTP** (`routes/*`): validation, cookies, status codes only.  
- **Application services** (`services/authApplication.service.ts`): session rules, including **refresh-token reuse** handling (replay revokes all sessions for that user).  
- **Persistence** (`repositories/*`, `models/*`): Mongoose models and narrow repository APIs.  
- **Cross-cutting**: Pino + `HttpError` mapping, **Mongo transactions** when rotating refresh tokens.

---

## Authentication (summary)

- **Access token**: short-lived JWT in JSON; kept in memory on the client; `Authorization: Bearer` for API calls.  
- **Refresh token**: opaque value in an **http-only** cookie; stored hashed in MongoDB; rotated in a transaction; optional **silent retry** on `TOKEN_INVALID` in the frontend client.

---

## Roles

| Role | Capabilities |
| ---- | ------------ |
| `USER` | Default after self-serve registration. |
| `ADMIN` | Can call `GET /v1/users` (user directory). |

Create or promote an admin:

```bash
cd apps/backend
MONGODB_URI="mongodb://127.0.0.1:27017/saas" \
ADMIN_EMAIL="you@company.com" \
ADMIN_PASSWORD="your-secure-password" \
npx tsx src/scripts/seedAdmin.ts
```

---

## Stripe mock (API)

- `POST /v1/billing/checkout-session` — authenticated; returns a mock session id and URL.  
- `POST /v1/billing/complete-mock` — completes a mock session and sets a fake Stripe customer id on the user.  
- `POST /v1/billing/webhook` — raw JSON + `stripe-signature` HMAC using `STRIPE_WEBHOOK_SECRET` (local testing pattern).

---

## NPM scripts (root)

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Run backend and frontend together |
| `npm run build` | Build both workspaces |
| `npm run lint` | ESLint in both workspaces |
| `npm run typecheck` | TypeScript check both workspaces |
| `npm run test` | Tests (backend Vitest; frontend if configured) |

---

## CI/CD

Workflow: `.github/workflows/ci.yml` — dependency install, lint, typecheck, tests (with MongoDB service when integration runs), and production builds. Add deploy jobs (Vercel, Fly.io, Render, etc.) when you are ready.

---

## Security before production

- Rotate JWT secrets and database credentials per environment.  
- Use HTTPS, tighten **CORS** to real app origins only, and keep the same-site / proxy story consistent for cookies.  
- Add monitoring, backups, and rate limits appropriate to your SLA.
