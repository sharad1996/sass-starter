import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).optional(),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().min(1).max(90).default(7),
  /** Comma-separated browser origins, e.g. `http://localhost:3000,http://127.0.0.1:3001` (needed when dev uses 127.0.0.1 vs localhost). */
  CORS_ORIGIN: z
    .string()
    .min(1)
    .transform((raw) =>
      raw
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().url()).min(1)),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
