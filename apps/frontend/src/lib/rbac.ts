import type { UserRole } from "./types";

export const ADMIN_ROLES: UserRole[] = ["ADMIN"];

/** True when `role` is included in `allowed` (or `allowed` is empty / undefined — no restriction). */
export function hasRole(role: UserRole, allowed?: readonly UserRole[] | UserRole[]): boolean {
  if (!allowed || allowed.length === 0) return true;
  return (allowed as UserRole[]).includes(role);
}

export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN";
}
