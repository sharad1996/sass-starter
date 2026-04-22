import type { NextFunction, Request, Response } from "express";
import type { Env } from "../config/env.js";
import { HttpError } from "../lib/httpError.js";
import { verifyAccessToken } from "../services/authTokens.js";
import type { UserRoleType } from "../models/User.js";

export type AuthedRequest = Request & {
  user?: { id: string; email: string; role: UserRoleType };
};

export function createAuthMiddleware(env: Env) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next(new HttpError(401, "Missing bearer token", "UNAUTHORIZED"));
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      return next(new HttpError(401, "Missing bearer token", "UNAUTHORIZED"));
    }
    try {
      const payload = verifyAccessToken(env, token);
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
      next();
    } catch {
      next(new HttpError(401, "Invalid or expired access token", "TOKEN_INVALID"));
    }
  };
}

export function requireRole(...roles: UserRoleType[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Unauthorized", "UNAUTHORIZED"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "Insufficient permissions", "FORBIDDEN"));
    }
    next();
  };
}
