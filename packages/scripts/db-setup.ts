/**
 * This script will initialize the db
 */

import chalk from "chalk"
import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as url from "url"

import { logger } from "@next-boilerplate/lib"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootDir = path.join(__dirname, "..", "..")

export const dbSetup = async () => {
  //* Initialize the database
  const appPath = path.join(rootDir, "apps", "app")
  logger.log(chalk.blue("Initializing the database..."))
  if (!fs.existsSync(appPath)) {
    logger.log(chalk.gray("Skipping database initialization (no app folder)"))
  } else if (!fs.existsSync(path.join(appPath, "prisma"))) {
    logger.log(chalk.gray("Skipping database initialization (no prisma folder in app)"))
  } else {
    //? Prisma command exists
    try {
      logger.log(chalk.gray("Checking if prisma is installed..."))
      execSync("npx --yes prisma --version", { cwd: appPath })
    } catch {
      logger.log(chalk.gray("Prisma is not installed"))
      logger.log(chalk.gray("Installing prisma..."))
      execSync("npm i -g prisma", { cwd: appPath })
    }

    //? Prisma migrate dev
    logger.log(chalk.gray("Migrating the database..."))
    try {
      execSync("prisma migrate dev", { cwd: appPath })
    } catch {
      logger.warn("Prisma migrate dev failed, please run it by yourself...")
    }

    //? Prisma seed
    logger.log(chalk.gray("Seeding the database..."))
    try {
      execSync("prisma db seed", { cwd: appPath })
    } catch {
      logger.warn("Prisma db seed failed, please run it by yourself...")
    }
  }
}
