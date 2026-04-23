import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildRequestUrl } from "./api";

describe("buildRequestUrl", () => {
  const orig = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  afterEach(() => {
    if (orig === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = orig;
    }
  });

  it("maps /v1 paths through the Next.js /api proxy", () => {
    expect(buildRequestUrl("/v1/health")).toBe("/api/v1/health");
  });

  it("prefixes bare relative segments", () => {
    expect(buildRequestUrl("users")).toBe("/api/v1/users");
  });

  it("uses NEXT_PUBLIC_API_URL when set", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://127.0.0.1:4000";
    expect(buildRequestUrl("/v1/auth/login")).toBe("http://127.0.0.1:4000/v1/auth/login");
  });

  it("strips trailing slash from public base", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://127.0.0.1:4000/";
    expect(buildRequestUrl("/v1/billing/checkout-session")).toBe(
      "http://127.0.0.1:4000/v1/billing/checkout-session"
    );
  });
});
