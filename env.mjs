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
    DATABASE_PRISMA_URL: z.string().nonempty(),
    DATABASE_URL_NON_POOLING: z.string().optional(),
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
    REDIS_USE_TLS: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    ENV: z.enum(["development", "recette", "production"]).optional(),
    BASE_URL: z.string().url(),
    VERCEL_URL: z.string().optional(),
    SMTP_HOST: z.string().nonempty(),
    SMTP_PORT: z
      .string()
      .nonempty()
      .transform((value) => parseInt(value)),
    SMTP_USERNAME: z.string().nonempty(),
    SMTP_PASSWORD: z.string().nonempty(),
    SMTP_FROM_NAME: z.string().nonempty(),
    SMTP_FROM_EMAIL: z.string().nonempty(),
    SUPPORT_EMAIL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_IS_DEMO: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    NEXT_PUBLIC_DEMO_EMAIL: z.string().optional(),
    NEXT_PUBLIC_DEMO_PASSWORD: z.string().optional(),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    PASSWORD_HASHER_SECRET: process.env.PASSWORD_HASHER_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_PRISMA_URL: process.env.DATABASE_PRISMA_URL,
    DATABASE_URL_NON_POOLING: process.env.DATABASE_URL_NON_POOLING,
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
    REDIS_USE_TLS: process.env.REDIS_USE_TLS,
    NEXT_PUBLIC_IS_DEMO: process.env.NEXT_PUBLIC_IS_DEMO,
    NEXT_PUBLIC_DEMO_EMAIL: process.env.NEXT_PUBLIC_DEMO_EMAIL,
    NEXT_PUBLIC_DEMO_PASSWORD: process.env.NEXT_PUBLIC_DEMO_PASSWORD,
    ENV: process.env.ENV,
    BASE_URL: process.env.BASE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  },
  onValidationError: (error) => {
    console.error(error)
    throw error
  },
})
