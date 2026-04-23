/**
 * Usage: MONGODB_URI=... ADMIN_EMAIL=admin@company.com ADMIN_PASSWORD='...' npx tsx src/scripts/seedAdmin.ts
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectMongo, disconnectMongo } from "../db/connect.js";
import { UserModel, UserRole } from "../models/User.js";

const input = z.object({
  MONGODB_URI: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(10),
  ADMIN_NAME: z.string().min(1).default("Administrator"),
});

async function main() {
  const env = input.parse(process.env);
  await connectMongo(env.MONGODB_URI);
  const email = env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  const existing = await UserModel.findOne({ email });
  if (!existing) {
    await UserModel.create({
      email,
      passwordHash,
      name: env.ADMIN_NAME,
      role: UserRole.ADMIN,
    });
    console.log("Created admin:", email);
  } else {
    await UserModel.updateOne(
      { _id: existing._id },
      { $set: { passwordHash, role: UserRole.ADMIN, name: env.ADMIN_NAME } }
    );
    console.log("Updated existing user to admin:", email);
  }
  await disconnectMongo();
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
