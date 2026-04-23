import { Router } from "express";
import type { ApplicationContext } from "../composition/applicationContext.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { HttpError } from "../lib/httpError.js";
import { UserRole } from "../models/User.js";
import { createAuthMiddleware, requireRole, type AuthedRequest } from "../middleware/auth.js";

export function createUsersRouter(ctx: Pick<ApplicationContext, "env" | "userRepository">) {
  const { env, userRepository } = ctx;
  const router = Router();
  const auth = createAuthMiddleware(env);

  router.get(
    "/users",
    auth,
    requireRole(UserRole.ADMIN),
    asyncHandler(async (_req, res) => {
      const users = await userRepository.listRecent(100);
      res.json({
        users: users.map((u) => ({
          id: String(u._id),
          email: u.email,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt,
        })),
      });
    })
  );

  router.get(
    "/users/:id",
    auth,
    asyncHandler(async (req: AuthedRequest, res) => {
      const targetId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
      if (req.user!.role !== UserRole.ADMIN && req.user!.id !== targetId) {
        throw new HttpError(403, "Forbidden", "FORBIDDEN");
      }
      const user = await userRepository.findById(targetId);
      if (!user) {
        throw new HttpError(404, "User not found", "NOT_FOUND");
      }
      res.json({
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    })
  );

  return router;
}
