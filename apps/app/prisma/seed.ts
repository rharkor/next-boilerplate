import { config } from "dotenv"
config()
import ora from "ora"

import { rolesAsObject } from "@/constants"
import { hash } from "@/lib/bcrypt"
import { env } from "@/lib/env"
import { logger } from "@next-boilerplate/lib"
import { PrismaClient } from "@prisma/client"

const spinner = ora()

const prisma = new PrismaClient()

const handleAction = async (actionName: string, doneName: string, action: Promise<unknown>) => {
  spinner.text = actionName
  spinner.color = "blue"
  spinner.start()
  await action
  spinner.clear()
  logger.info(doneName)
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
    } else {
      logger.log("Admin already exists")
    }
  } catch (e) {
    logger.error(e)
    process.exit(1)
  } finally {
    spinner.stop()
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
