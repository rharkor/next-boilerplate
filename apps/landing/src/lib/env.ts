import { z } from "zod"

import { logger } from "@next-boilerplate/lib/logger"
import { createEnv } from "@t3-oss/env-nextjs"

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  onValidationError: (error) => {
    logger.error(error)
    throw "Invalid environment variables"
  },
})
