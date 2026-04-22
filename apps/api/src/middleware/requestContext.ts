import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { Logger } from "pino";

export function requestContextMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.header("x-request-id")?.trim() || randomUUID();
    res.setHeader("x-request-id", requestId);
    req.requestId = requestId;
    req.log = logger.child({
      requestId,
      method: req.method,
      path: req.path,
    });
    next();
  };
}
