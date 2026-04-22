import { describe, expect, it } from "vitest";
import { buildMockWebhookSignature, verifyMockWebhookSignature } from "./stripeMock.js";
import type { Env } from "../config/env.js";

const mockEnv = {
  STRIPE_WEBHOOK_SECRET: "test_secret_for_webhook_signing_only",
} as Pick<Env, "STRIPE_WEBHOOK_SECRET"> as Env;

describe("stripeMock", () => {
  it("verifies mock webhook signatures", () => {
    const payload = JSON.stringify({ type: "checkout.session.completed" });
    const sig = buildMockWebhookSignature(mockEnv, payload);
    expect(verifyMockWebhookSignature(mockEnv, payload, sig)).toBe(true);
    expect(verifyMockWebhookSignature(mockEnv, payload, "wrong")).toBe(false);
  });
});
