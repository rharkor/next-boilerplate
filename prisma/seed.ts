import { PrismaClient } from "@prisma/client"
import { hash as bhash } from "bcryptjs"
import { Spinner } from "cli-spinner"
import crypto from "crypto-js"
import { config } from "dotenv"
import { logger as oLogger } from "../src/lib/logger"
import { rolesAsObject } from "../src/types/constants"
config()

const env = {
  AUTH_ADMIN_EMAIL: process.env.AUTH_ADMIN_EMAIL,
  AUTH_ADMIN_PASSWORD: process.env.AUTH_ADMIN_PASSWORD,
  PASSWORD_HASHER_SECRET: process.env.PASSWORD_HASHER_SECRET,
}

const hash = async (value: string, saltOrRounds: string | number) => {
  const preHashed = crypto.HmacSHA256(value, env.PASSWORD_HASHER_SECRET ?? "").toString()
  return await bhash(preHashed, saltOrRounds)
}

if (!env.AUTH_ADMIN_EMAIL || !env.AUTH_ADMIN_PASSWORD || !env.PASSWORD_HASHER_SECRET) {
  console.error("Missing AUTH_ADMIN_EMAIL or AUTH_ADMIN_PASSWORD or PASSWORD_HASHER_SECRET")
  process.exit(1)
}

let spinner: Spinner | null = null

const chalk = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
}

const logger = {
  ...oLogger,
  log: (text: string) => {
    console.log(chalk.green(text + " ✔"))
  },
}

const prisma = new PrismaClient()

async function main() {
  try {
    spinner = new Spinner(chalk.blue(" Creating admin.. %s"))
    spinner.setSpinnerString(18)
    spinner.start()
    await prisma.user.upsert({
      where: {
        email: env.AUTH_ADMIN_EMAIL,
      },
      update: {},
      create: {
        email: env.AUTH_ADMIN_EMAIL as string,
        password: await hash(env.AUTH_ADMIN_PASSWORD ?? "", 12),
        role: rolesAsObject.admin,
        username: "admin",
        emailVerified: new Date(),
      },
    })
    spinner.stop(true)
    logger.log("Admin created")
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
