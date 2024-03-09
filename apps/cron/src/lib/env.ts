import { config } from "dotenv"
import { z } from "zod"

import { createEnv } from "@t3-oss/env-core"

if (!process.env.ENV) {
  config()
}

export const env = createEnv({
  server: {
    ENV: z.enum(["development", "staging", "preproduction", "production"]).optional(),
    DATABASE_PRISMA_URL: z.string().min(1),
    DATABASE_URL_NON_POOLING: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
