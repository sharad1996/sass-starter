import { describe, expect, it } from "vitest";
import { hasRole, isAdminRole } from "./rbac";

describe("hasRole", () => {
  it("returns true when allowed list is empty", () => {
    expect(hasRole("USER", [])).toBe(true);
  });

  it("returns true when role is in allowed list", () => {
    expect(hasRole("ADMIN", ["ADMIN"])).toBe(true);
  });

  it("returns false when role is not in allowed list", () => {
    expect(hasRole("USER", ["ADMIN"])).toBe(false);
  });
});

describe("isAdminRole", () => {
  it("identifies ADMIN", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("USER")).toBe(false);
  });
});
