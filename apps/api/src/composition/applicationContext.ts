import type { Logger } from "pino";
import type { Env } from "../config/env.js";
import { createLogger } from "../lib/logger.js";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { AuthApplicationService } from "../services/authApplication.service.js";

export type ApplicationContext = {
  env: Env;
  logger: Logger;
  userRepository: UserRepository;
  authApplicationService: AuthApplicationService;
};

export function createApplicationContext(env: Env): ApplicationContext {
  const logger = createLogger(env);
  const userRepository = new UserRepository();
  const refreshTokenRepository = new RefreshTokenRepository();
  const authApplicationService = new AuthApplicationService(env, userRepository, refreshTokenRepository);
  return { env, logger, userRepository, authApplicationService };
}
