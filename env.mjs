import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    PASSWORD_HASHER_SECRET: z.string().nonempty().min(16),
    JWT_SECRET: z.string().nonempty().min(16),
    DATABASE_URL: z.string().nonempty(),
    NEXTAUTH_SECRET: z.string().nonempty().min(16),
    NEXTAUTH_URL: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().nonempty(),
    GITHUB_CLIENT_SECRET: z.string().nonempty(),
    AUTH_ADMIN_EMAIL: z.string().nonempty(),
    AUTH_ADMIN_PASSWORD: z.string().nonempty(),
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z
      .string()
      .optional()
      .transform((value) => parseInt(value)),
    REDIS_USERNAME: z.string().optional(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_URL: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    PASSWORD_HASHER_SECRET: process.env.PASSWORD_HASHER_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    AUTH_ADMIN_EMAIL: process.env.AUTH_ADMIN_EMAIL,
    AUTH_ADMIN_PASSWORD: process.env.AUTH_ADMIN_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_TLS: process.env.REDIS_TLS,
    REDIS_URL: process.env.REDIS_URL,
  },
  onValidationError: (error) => {
    console.error(error)
    throw error
  },
})
