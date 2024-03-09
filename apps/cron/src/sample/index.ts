import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { logger } from "@lib/logger"

const main = async () => {
  const maxDurationWarning = 1000 * 60 * 5 // 5 minutes
  const name = "CronName"
  const now = new Date()
  //? Do something
  async function something() {
    logger.debug(`[${now.toLocaleString()}] ${name} started`)
    const users = await prisma.user.findMany()
    logger.debug(`[${now.toLocaleString()}] ${name} found ${users.length} users on env ${env.ENV}`)
  }
  await something().catch((err) => {
    logger.error(
      `[${now.toLocaleString()}] ${name} started at ${now.toLocaleString()} and failed after ${
        new Date().getTime() - now.getTime()
      }ms`
    )
    throw err
  })
  const took = new Date().getTime() - now.getTime()
  if (took > maxDurationWarning) logger.warn(`[${now.toLocaleString()}] ${name} took ${took}ms`)
}

main()
