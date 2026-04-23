import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError.js";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const log = req.log;

  if (err instanceof HttpError) {
    if (err.status >= 500) {
      log?.error({ err, requestId: req.requestId }, err.message);
    } else if (err.status === 401) {
      log?.debug({ code: err.code, requestId: req.requestId }, err.message);
    } else {
      log?.info({ status: err.status, code: err.code, requestId: req.requestId }, err.message);
    }
    return res.status(err.status).json({ error: { message: err.message, code: err.code } });
  }
  if (err instanceof ZodError) {
    log?.info({ requestId: req.requestId }, "validation failed");
    return res.status(400).json({
      error: { message: "Validation failed", code: "VALIDATION_ERROR", details: err.flatten() },
    });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    log?.warn({ err, requestId: req.requestId }, "mongoose validation");
    return res.status(400).json({ error: { message: err.message, code: "VALIDATION_ERROR" } });
  }
  if (err && typeof err === "object" && "code" in err && err.code === 11000) {
    log?.warn({ requestId: req.requestId }, "duplicate key");
    const keyPattern = (err as { keyPattern?: Record<string, unknown> }).keyPattern;
    if (keyPattern && "email" in keyPattern) {
      return res
        .status(409)
        .json({ error: { message: "An account with this email already exists", code: "EMAIL_TAKEN" } });
    }
    return res.status(409).json({ error: { message: "Duplicate key", code: "CONFLICT" } });
  }
  log?.error({ err, requestId: req.requestId }, "unhandled error");
  return res.status(500).json({ error: { message: "Internal server error", code: "INTERNAL" } });
}
