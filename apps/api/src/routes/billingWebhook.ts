import type { RequestHandler } from "express";
import type { Env } from "../config/env.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { HttpError } from "../lib/httpError.js";
import { verifyMockWebhookSignature } from "../services/stripeMock.js";

export function billingWebhookHandler(env: Env): RequestHandler {
  return asyncHandler(async (req, res) => {
    const raw = req.body instanceof Buffer ? req.body.toString("utf8") : String(req.body ?? "");
    const sig = req.headers["stripe-signature"] as string | undefined;
    if (!verifyMockWebhookSignature(env, raw, sig)) {
      throw new HttpError(400, "Invalid webhook signature", "WEBHOOK_INVALID");
    }
    let event: { type?: string; data?: unknown };
    try {
      event = JSON.parse(raw) as { type?: string; data?: unknown };
    } catch {
      throw new HttpError(400, "Invalid JSON", "BAD_JSON");
    }
    res.json({ received: true, type: event.type ?? "unknown", mock: true });
  });
}
