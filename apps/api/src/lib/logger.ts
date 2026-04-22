import pino from "pino";
import type { Env } from "../config/env.js";

export function createLogger(env: Env): pino.Logger {
  const level = env.LOG_LEVEL ?? (env.NODE_ENV === "production" ? "info" : "debug");
  return pino({
    level,
    base: { service: "saas-api" },
    redact: ["req.headers.authorization", "req.headers.cookie", "password", "passwordHash"],
  });
}
