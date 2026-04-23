import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import type { Env } from "./config/env.js";
import { connectMongo, disconnectMongo } from "./db/connect.js";
import { UserModel, UserRole } from "./models/User.js";

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

  it("runs mock billing checkout and completion", async () => {
    const reg = await request(app)
      .post("/v1/auth/register")
      .send({
        email: "billing-user@test.dev",
        password: "longpassword1",
        name: "Billing",
      })
      .expect(201);
    const token = reg.body.accessToken as string;
    const checkout = await request(app)
      .post("/v1/billing/checkout-session")
      .set("Authorization", `Bearer ${token}`)
      .send({
        successUrl: "http://localhost:3000/dashboard/billing",
        cancelUrl: "http://localhost:3000/dashboard/billing",
        amount: 4900,
      })
      .expect(201);
    const sessionId = checkout.body.sessionId as string;
    expect(sessionId).toMatch(/^cs_mock_/);
    expect(String(checkout.body.url)).toContain("session_id=");
    const done = await request(app)
      .post("/v1/billing/complete-mock")
      .set("Authorization", `Bearer ${token}`)
      .send({ sessionId })
      .expect(200);
    expect(done.body.customerId).toMatch(/^cus_mock_/);
    expect(done.body.status).toBe("active");
  });

  it("returns 403 when a non-admin lists users", async () => {
    const reg = await request(app)
      .post("/v1/auth/register")
      .send({
        email: "rbac-user@test.dev",
        password: "longpassword1",
        name: "RBAC User",
      })
      .expect(201);
    const token = reg.body.accessToken as string;
    const list = await request(app).get("/v1/users").set("Authorization", `Bearer ${token}`).expect(403);
    expect(list.body.error?.code).toBe("FORBIDDEN");
  });

  it("allows listing users after promotion to ADMIN and a new login", async () => {
    const password = "longpassword1";
    await request(app)
      .post("/v1/auth/register")
      .send({
        email: "rbac-promote@test.dev",
        password,
        name: "Promoted",
      })
      .expect(201);

    await UserModel.updateOne({ email: "rbac-promote@test.dev" }, { $set: { role: UserRole.ADMIN } });

    const login = await request(app)
      .post("/v1/auth/login")
      .send({ email: "rbac-promote@test.dev", password })
      .expect(200);
    const adminToken = login.body.accessToken as string;
    expect(login.body.user.role).toBe("ADMIN");

    const list = await request(app).get("/v1/users").set("Authorization", `Bearer ${adminToken}`).expect(200);
    expect(Array.isArray(list.body.users)).toBe(true);
    expect(list.body.users.length).toBeGreaterThan(0);
  });
});
