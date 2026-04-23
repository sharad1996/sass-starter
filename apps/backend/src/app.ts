import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Env } from "./config/env.js";
import { createApplicationContext } from "./composition/applicationContext.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestContextMiddleware } from "./middleware/requestContext.js";
import { healthRouter } from "./routes/health.js";
import { createAuthRouter } from "./routes/auth.js";
import { createUsersRouter } from "./routes/users.js";
import { createBillingRouter } from "./routes/billing.js";
import { billingWebhookHandler } from "./routes/billingWebhook.js";

export function createApp(env: Env) {
  const app = express();
  const ctx = createApplicationContext(env);

  app.set("trust proxy", 1);

  app.use(requestContextMiddleware(ctx.logger));

  const allowedOrigins = new Set(env.CORS_ORIGIN);
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }
        if (allowedOrigins.has(origin)) {
          return callback(null, origin);
        }
        return callback(null, false);
      },
    })
  );
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cookieParser());

  app.post("/v1/billing/webhook", express.raw({ type: "application/json" }), billingWebhookHandler(env));

  app.use(express.json({ limit: "1mb" }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/v1/auth/login", authLimiter);
  app.use("/v1/auth/register", authLimiter);
  app.use("/v1/auth/refresh", authLimiter);

  app.use("/v1", healthRouter);
  app.use("/v1/auth", createAuthRouter(ctx));
  app.use("/v1", createUsersRouter(ctx));
  app.use("/v1", createBillingRouter(env));

  app.use((_req, res) => {
    res.status(404).json({ error: { message: "Not found", code: "NOT_FOUND" } });
  });

  app.use(errorHandler);

  return app;
}
