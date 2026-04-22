import { describe, expect, it, vi } from "vitest";
import type { Types } from "mongoose";
import type { Env } from "../config/env.js";
import { AuthApplicationService } from "./authApplication.service.js";

const env = {
  NODE_ENV: "test",
  PORT: 0,
  MONGODB_URI: "mongodb://localhost",
  JWT_ACCESS_SECRET: "01234567890123456789012345678901",
  JWT_REFRESH_SECRET: "0123456789012345678901234567890x",
  ACCESS_TOKEN_EXPIRES: "15m",
  REFRESH_TOKEN_EXPIRES_DAYS: 7,
  CORS_ORIGIN: ["http://localhost:3000"],
  STRIPE_WEBHOOK_SECRET: "whsec_test",
} as Env;

describe("AuthApplicationService.refreshSession", () => {
  it("revokes every session when a revoked refresh token is replayed", async () => {
    const userId = { toString: () => "user" } as unknown as Types.ObjectId;
    const users = {
      createUser: vi.fn(),
      findByEmailWithPassword: vi.fn(),
      findById: vi.fn(),
      listRecent: vi.fn(),
    };
    const refresh = {
      findByTokenHash: vi.fn().mockResolvedValue({
        _id: userId,
        userId,
        tokenHash: "hash",
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
      }),
      issueToken: vi.fn(),
      rotateIssuedToken: vi.fn(),
      revokeEverySessionForUser: vi.fn().mockResolvedValue(undefined),
      revokeByTokenHash: vi.fn(),
    };
    const service = new AuthApplicationService(env, users as never, refresh as never);
    await expect(service.refreshSession("opaque")).rejects.toMatchObject({ code: "REFRESH_REUSE" });
    expect(refresh.revokeEverySessionForUser).toHaveBeenCalledOnce();
  });
});
