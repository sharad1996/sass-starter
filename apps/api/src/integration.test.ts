import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import type { Env } from "./config/env.js";
import { connectMongo, disconnectMongo } from "./db/connect.js";

const runIntegration = process.env.CI === "true" || process.env.RUN_API_INTEGRATION === "1";
const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/saas_ci";

const testEnv = {
  NODE_ENV: "test",
  PORT: 0,
  MONGODB_URI: uri,
  JWT_ACCESS_SECRET: "01234567890123456789012345678901",
  JWT_REFRESH_SECRET: "0123456789012345678901234567890x",
  ACCESS_TOKEN_EXPIRES: "15m",
  REFRESH_TOKEN_EXPIRES_DAYS: 7,
  CORS_ORIGIN: ["http://localhost:3000"],
  STRIPE_WEBHOOK_SECRET: "whsec_test",
} as Env;

describe.skipIf(!runIntegration)("API integration", () => {
  const app = createApp(testEnv);

  beforeAll(async () => {
    await connectMongo(testEnv.MONGODB_URI);
    await mongoose.connection.db?.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await disconnectMongo();
  });

  it("returns health", async () => {
    const res = await request(app).get("/v1/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.db).toBe("up");
  });

  it("registers and returns access token", async () => {
    const res = await request(app)
      .post("/v1/auth/register")
      .send({
        email: "user@test.dev",
        password: "longpassword1",
        name: "User",
      })
      .expect(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user.email).toBe("user@test.dev");
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});
