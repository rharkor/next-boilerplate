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
  },
  client: {},
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    PASSWORD_HASHER_SECRET: process.env.PASSWORD_HASHER_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
})
