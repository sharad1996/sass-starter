import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import type { Env } from "./config/env.js";

const testEnv = {
  NODE_ENV: "test",
  PORT: 0,
  MONGODB_URI: "mongodb://127.0.0.1:27017/saas_http_tests",
  JWT_ACCESS_SECRET: "01234567890123456789012345678901",
  JWT_REFRESH_SECRET: "0123456789012345678901234567890x",
  ACCESS_TOKEN_EXPIRES: "15m",
  REFRESH_TOKEN_EXPIRES_DAYS: 7,
  CORS_ORIGIN: ["http://localhost:3000"],
  STRIPE_WEBHOOK_SECRET: "whsec_test",
} as Env;

describe("HTTP surface (no database)", () => {
  const app = createApp(testEnv);

  it("GET /v1/health returns status ok", async () => {
    const res = await request(app).get("/v1/health").expect(200);
    expect(res.body).toMatchObject({ status: "ok" });
    expect(["up", "down"]).toContain(res.body.db);
  });

  it("returns 404 JSON for unknown routes", async () => {
    const res = await request(app).get("/v1/this-route-does-not-exist").expect(404);
    expect(res.body.error?.code).toBe("NOT_FOUND");
  });
});
