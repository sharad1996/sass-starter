import type { ClientSession } from "mongoose";
import { UserModel, type UserDoc, type UserRoleType } from "../models/User.js";

export type UserWithPassword = UserDoc & { passwordHash: string };

export class UserRepository {
  async createUser(
    input: { email: string; passwordHash: string; name: string; role: UserRoleType },
    session?: ClientSession
  ): Promise<UserDoc> {
    if (session) {
      const [created] = await UserModel.create([input], { session });
      return created!;
    }
    const [created] = await UserModel.create([input]);
    return created!;
  }

  findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash").exec() as Promise<
      UserWithPassword | null
    >;
  }

  findById(id: string): Promise<UserDoc | null> {
    return UserModel.findById(id).exec();
  }

  async listRecent(limit: number): Promise<
    Array<Pick<UserDoc, "email" | "name" | "role" | "createdAt"> & { _id: UserDoc["_id"] }>
  > {
    return UserModel.find().sort({ createdAt: -1 }).limit(limit).select("email name role createdAt").lean().exec();
  }
}
