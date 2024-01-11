import { config } from "dotenv"
config()
import chalk from "chalk"
import { Spinner } from "cli-spinner"

import { hash } from "@/lib/bcrypt"
import { logger } from "@lib/logger"
import { PrismaClient } from "@prisma/client"

import { rolesAsObject } from "../src/types/constants"

const env = {
  AUTH_ADMIN_EMAIL: process.env.AUTH_ADMIN_EMAIL,
  AUTH_ADMIN_PASSWORD: process.env.AUTH_ADMIN_PASSWORD,
  PASSWORD_HASHER_SECRET: process.env.PASSWORD_HASHER_SECRET,
}

if (!env.AUTH_ADMIN_EMAIL || !env.AUTH_ADMIN_PASSWORD || !env.PASSWORD_HASHER_SECRET) {
  logger.error("Missing AUTH_ADMIN_EMAIL or AUTH_ADMIN_PASSWORD or PASSWORD_HASHER_SECRET")
  process.exit(1)
}

let spinner: Spinner | null = null

const prisma = new PrismaClient()

const handleAction = async (actionName: string, doneName: string, action: Promise<unknown>) => {
  spinner = new Spinner(chalk.blue(` ${actionName}`))
  spinner.setSpinnerString(18)
  spinner.start()
  await action
  spinner.stop(true)
  logger.log(doneName)
}

async function main() {
  try {
    // ADMIN
    const adminExists = await prisma.user.findFirst({
      where: {
        email: env.AUTH_ADMIN_EMAIL,
      },
    })
    if (!adminExists) {
      await handleAction(
        "Creating admin",
        "Admin created",
        prisma.user.create({
          data: {
            email: env.AUTH_ADMIN_EMAIL as string,
            password: await hash(env.AUTH_ADMIN_PASSWORD ?? "", 12),
            role: rolesAsObject.admin,
            username: "admin",
            emailVerified: new Date(),
            hasPassword: true,
          },
        })
      )
    }
  } catch (e) {
    logger.error(e)
    process.exit(1)
  } finally {
    spinner?.stop(true)
    await prisma.$disconnect()
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    logger.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
