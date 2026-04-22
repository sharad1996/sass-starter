import crypto from "node:crypto";
import type { Env } from "../config/env.js";

export interface MockCheckoutSession {
  id: string;
  url: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: "open" | "complete" | "expired";
  createdAt: string;
}

const sessions = new Map<string, MockCheckoutSession>();

export function createMockCheckoutSession(input: {
  customerEmail: string;
  amount?: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
}): MockCheckoutSession {
  const id = `cs_mock_${crypto.randomBytes(12).toString("hex")}`;
  const session: MockCheckoutSession = {
    id,
    url: `${input.successUrl}?session_id=${encodeURIComponent(id)}&mock=1`,
    customerEmail: input.customerEmail,
    amount: input.amount ?? 2900,
    currency: input.currency ?? "usd",
    status: "open",
    createdAt: new Date().toISOString(),
  };
  sessions.set(id, session);
  return session;
}

export function getMockSession(id: string): MockCheckoutSession | undefined {
  return sessions.get(id);
}

export function completeMockSession(id: string): MockCheckoutSession | undefined {
  const s = sessions.get(id);
  if (!s) return undefined;
  s.status = "complete";
  sessions.set(id, s);
  return s;
}

export function verifyMockWebhookSignature(
  env: Env,
  payload: string,
  signatureHeader: string | undefined
): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", env.STRIPE_WEBHOOK_SECRET).update(payload).digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function buildMockWebhookSignature(env: Env, payload: string): string {
  return crypto.createHmac("sha256", env.STRIPE_WEBHOOK_SECRET).update(payload).digest("hex");
}
