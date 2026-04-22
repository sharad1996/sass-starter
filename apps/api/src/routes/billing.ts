import { Router } from "express";
import { z } from "zod";
import type { Env } from "../config/env.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { HttpError } from "../lib/httpError.js";
import { createAuthMiddleware, type AuthedRequest } from "../middleware/auth.js";
import { UserModel } from "../models/User.js";
import { completeMockSession, createMockCheckoutSession } from "../services/stripeMock.js";

const checkoutSchema = z.object({
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  amount: z.number().int().positive().optional(),
});

export function createBillingRouter(env: Env) {
  const router = Router();
  const auth = createAuthMiddleware(env);

  router.post(
    "/billing/checkout-session",
    auth,
    asyncHandler(async (req: AuthedRequest, res) => {
      const body = checkoutSchema.parse(req.body);
      const user = await UserModel.findById(req.user!.id);
      if (!user) {
        throw new HttpError(404, "User not found", "NOT_FOUND");
      }
      const session = createMockCheckoutSession({
        customerEmail: user.email,
        amount: body.amount,
        successUrl: body.successUrl,
        cancelUrl: body.cancelUrl,
      });
      res.status(201).json({
        sessionId: session.id,
        url: session.url,
        mock: true,
      });
    })
  );

  router.post(
    "/billing/complete-mock",
    auth,
    asyncHandler(async (req: AuthedRequest, res) => {
      const schema = z.object({ sessionId: z.string().min(1) });
      const { sessionId } = schema.parse(req.body);
      const session = completeMockSession(sessionId);
      if (!session) {
        throw new HttpError(404, "Session not found", "NOT_FOUND");
      }
      await UserModel.updateOne({ _id: req.user!.id }, { $set: { stripeCustomerId: `cus_mock_${req.user!.id}` } });
      res.json({ status: "active", session, customerId: `cus_mock_${req.user!.id}` });
    })
  );

  return router;
}
