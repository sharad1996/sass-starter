import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import ms from "ms";
import type { Env } from "../config/env.js";
import type { UserRoleType } from "../models/User.js";

export interface AccessPayload {
  sub: string;
  email: string;
  role: UserRoleType;
}

export function signAccessToken(
  env: Env,
  payload: AccessPayload
): string {
  const expiresIn = env.ACCESS_TOKEN_EXPIRES as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn, issuer: "saas-api", audience: "saas-web" });
}

export function verifyAccessToken(env: Env, token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "saas-api",
    audience: "saas-web",
  });
  if (typeof decoded === "string" || !decoded.sub || !decoded.email || !decoded.role) {
    throw new Error("Invalid access token payload");
  }
  return {
    sub: decoded.sub,
    email: String(decoded.email),
    role: decoded.role as AccessPayload["role"],
  };
}

export function createRefreshTokenValue(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function refreshExpiresAt(env: Env): Date {
  const ttlMs = ms(`${env.REFRESH_TOKEN_EXPIRES_DAYS}d`);
  if (typeof ttlMs !== "number") {
    throw new Error("Invalid REFRESH_TOKEN_EXPIRES_DAYS");
  }
  return new Date(Date.now() + ttlMs);
}
