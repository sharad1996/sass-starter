import { Router } from "express";
import type { ApplicationContext } from "../composition/applicationContext.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { HttpError } from "../lib/httpError.js";
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from "../lib/refreshCookie.js";
import { createAuthMiddleware, type AuthedRequest } from "../middleware/auth.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";

const refreshFailureCodes = new Set([
  "NO_REFRESH",
  "REFRESH_INVALID",
  "REFRESH_REUSE",
  "REFRESH_EXPIRED",
  "USER_MISSING",
]);

export function createAuthRouter(ctx: Pick<ApplicationContext, "env" | "authApplicationService">) {
  const { env, authApplicationService } = ctx;
  const router = Router();
  const auth = createAuthMiddleware(env);

  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      const body = registerSchema.parse(req.body);
      const session = await authApplicationService.register(body);
      setRefreshCookie(res, env, session.rawRefresh);
      res.status(201).json({ user: session.user, accessToken: session.accessToken });
    })
  );

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const body = loginSchema.parse(req.body);
      const session = await authApplicationService.login(body);
      setRefreshCookie(res, env, session.rawRefresh);
      res.json({ user: session.user, accessToken: session.accessToken });
    })
  );

  router.post(
    "/refresh",
    asyncHandler(async (req, res) => {
      const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
      try {
        const session = await authApplicationService.refreshSession(raw);
        setRefreshCookie(res, env, session.rawRefresh);
        res.json({ user: session.user, accessToken: session.accessToken });
      } catch (err) {
        if (err instanceof HttpError && err.code && refreshFailureCodes.has(err.code)) {
          clearRefreshCookie(res);
        }
        throw err;
      }
    })
  );

  router.post(
    "/logout",
    asyncHandler(async (req, res) => {
      const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
      await authApplicationService.logout(raw);
      clearRefreshCookie(res);
      res.status(204).end();
    })
  );

  router.get(
    "/me",
    auth,
    asyncHandler(async (req: AuthedRequest, res) => {
      const user = await authApplicationService.getAuthedProfile(req.user!.id);
      res.json({ user });
    })
  );

  return router;
}
