import { config } from "dotenv"
config()
import ora from "ora"

import { rolesAsObject } from "@/constants"
import { hash } from "@/lib/bcrypt"
import { env } from "@/lib/env"
import { logger, startTask } from "@next-boilerplate/lib"
import { PrismaClient } from "@prisma/client"

const spinner = ora()

const prisma = new PrismaClient()

async function main() {
  try {
    //* Admin
    const adminExists = await prisma.user.findFirst({
      where: {
        email: env.AUTH_ADMIN_EMAIL,
      },
    })
    if (!adminExists) {
      const task = await startTask({
        name: "Creating admin",
        successMessage: "Admin created",
      })
      await prisma.user.create({
        data: {
          email: env.AUTH_ADMIN_EMAIL as string,
          password: await hash(env.AUTH_ADMIN_PASSWORD ?? "", 12),
          role: rolesAsObject.admin,
          emailVerified: new Date(),
          hasPassword: true,
          name: "Admin",
        },
      })
      task.stop()
    } else {
      logger.log("Admin already exists")
    }
  } catch (e) {
    console.error(e)
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
