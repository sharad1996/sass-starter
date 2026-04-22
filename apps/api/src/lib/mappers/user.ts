import type { UserRoleType } from "../../models/User.js";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
};

export function toPublicUser(u: { _id: unknown; email: string; name: string; role: UserRoleType }): PublicUser {
  return { id: String(u._id), email: u.email, name: u.name, role: u.role };
}
