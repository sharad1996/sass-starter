import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import type { Env } from "../config/env.js";
import type { UserDoc } from "../models/User.js";
import { runInTransaction } from "../db/runInTransaction.js";
import { HttpError } from "../lib/httpError.js";
import { toPublicUser, type PublicUser } from "../lib/mappers/user.js";
import { UserRole } from "../models/User.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schemas.js";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import {
  createRefreshTokenValue,
  hashToken,
  refreshExpiresAt,
  signAccessToken,
} from "./authTokens.js";

const BCRYPT_COST = 12;

export type IssuedSession = {
  user: PublicUser;
  accessToken: string;
  rawRefresh: string;
};

export class AuthApplicationService {
  constructor(
    private readonly env: Env,
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository
  ) {}

  async register(input: RegisterInput): Promise<IssuedSession> {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    const user = await this.users.createUser({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      role: UserRole.USER,
    });
    return this.issueSessionForUser(user);
  }

  async login(input: LoginInput): Promise<IssuedSession> {
    const user = await this.users.findByEmailWithPassword(input.email);
    if (!user?.passwordHash) {
      throw new HttpError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }
    const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordOk) {
      throw new HttpError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }
    return this.issueSessionForUser(user);
  }

  async refreshSession(rawRefresh: string | undefined): Promise<IssuedSession> {
    if (!rawRefresh) {
      throw new HttpError(401, "Missing refresh token", "NO_REFRESH");
    }
    const tokenHash = hashToken(rawRefresh);
    const record = await this.refreshTokens.findByTokenHash(tokenHash);
    if (!record) {
      throw new HttpError(401, "Invalid refresh token", "REFRESH_INVALID");
    }
    if (record.revokedAt) {
      await this.refreshTokens.revokeEverySessionForUser(record.userId as Types.ObjectId);
      throw new HttpError(401, "Refresh token reuse detected", "REFRESH_REUSE");
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new HttpError(401, "Refresh token expired", "REFRESH_EXPIRED");
    }
    const user = await this.users.findById(String(record.userId));
    if (!user) {
      throw new HttpError(401, "User not found", "USER_MISSING");
    }
    const newRaw = createRefreshTokenValue();
    const newHash = hashToken(newRaw);
    await runInTransaction(async (session) => {
      await this.refreshTokens.rotateIssuedToken(
        {
          existingId: record._id,
          userId: record.userId as Types.ObjectId,
          newTokenHash: newHash,
          expiresAt: refreshExpiresAt(this.env),
        },
        session
      );
    });
    const accessToken = signAccessToken(this.env, {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    });
    return { user: toPublicUser(user), accessToken, rawRefresh: newRaw };
  }

  async logout(rawRefresh: string | undefined): Promise<void> {
    if (!rawRefresh) return;
    await this.refreshTokens.revokeByTokenHash(hashToken(rawRefresh));
  }

  async getAuthedProfile(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new HttpError(404, "User not found", "NOT_FOUND");
    }
    return toPublicUser(user);
  }

  private async issueSessionForUser(user: UserDoc): Promise<IssuedSession> {
    const accessToken = signAccessToken(this.env, {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    });
    const rawRefresh = createRefreshTokenValue();
    await this.refreshTokens.issueToken(user._id as Types.ObjectId, hashToken(rawRefresh), refreshExpiresAt(this.env));
    return { user: toPublicUser(user), accessToken, rawRefresh };
  }
}
