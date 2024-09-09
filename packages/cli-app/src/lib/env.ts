/* eslint-disable no-process-env */

import { z } from "zod"

import { logger } from "@rharkor/logger"

const schema = z.object({
  ROOT_PATH: z.string(),
})

if (!process.env.ROOT_PATH) {
  logger.init().then(() => {
    logger.warn("ROOT_PATH is not defined, using the current working directory")
  })
}

const parsed = schema.safeParse({
  ROOT_PATH: process.cwd(),
  ...process.env,
})

if (!parsed.success) {
  logger.error("Error parsing env", parsed.error)
  process.exit(1)
}

export const env = parsed.data
