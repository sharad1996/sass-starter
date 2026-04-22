import type { ClientSession } from "mongoose";
import type { Types } from "mongoose";
import { RefreshTokenModel, type RefreshTokenDoc } from "../models/RefreshToken.js";

export class RefreshTokenRepository {
  findByTokenHash(tokenHash: string): Promise<RefreshTokenDoc | null> {
    return RefreshTokenModel.findOne({ tokenHash }).exec();
  }

  async issueToken(
    userId: Types.ObjectId,
    tokenHash: string,
    expiresAt: Date,
    session?: ClientSession
  ): Promise<void> {
    await RefreshTokenModel.create([{ userId, tokenHash, expiresAt }], session ? { session } : {});
  }

  async rotateIssuedToken(
    params: {
      existingId: Types.ObjectId;
      userId: Types.ObjectId;
      newTokenHash: string;
      expiresAt: Date;
    },
    session: ClientSession
  ): Promise<void> {
    await RefreshTokenModel.updateOne(
      { _id: params.existingId },
      { $set: { revokedAt: new Date(), replacedByTokenHash: params.newTokenHash } },
      { session }
    );
    await RefreshTokenModel.create(
      [{ userId: params.userId, tokenHash: params.newTokenHash, expiresAt: params.expiresAt }],
      { session }
    );
  }

  async revokeEverySessionForUser(userId: Types.ObjectId, session?: ClientSession): Promise<void> {
    await RefreshTokenModel.updateMany({ userId }, { $set: { revokedAt: new Date() } }, session ? { session } : {});
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await RefreshTokenModel.updateOne({ tokenHash }, { $set: { revokedAt: new Date() } });
  }
}
