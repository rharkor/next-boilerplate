import { exit } from "process"

import { logger } from "@next-boilerplate/lib"

async function sample() {
  // Your code here
}

const main = async () => {
  const maxDurationWarning = 1000 * 60 * 5 // 5 minutes
  const name = "Sample"
  const now = new Date()

  logger.prefix = () => `[${new Date().toLocaleString()}] `
  await sample().catch((err) => {
    logger.error(
      `${name} started at ${now.toLocaleString()} and failed after ${new Date().getTime() - now.getTime()}ms`
    )
    throw err
  })
  const took = new Date().getTime() - now.getTime()
  if (took > maxDurationWarning) logger.warn(`${name} took ${took}ms`)

  exit(0)
}

main()
