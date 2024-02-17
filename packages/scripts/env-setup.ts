/**
 * This script will initialize the environment variables and the db
 */

import chalk from "chalk"
import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as url from "url"

import { logger } from "@lib/logger"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootDir = path.join(__dirname, "..", "..")
export const envSetup = async (initDb: boolean = true) => {
  //* Copy the .env.example to .env for
  // App
  const appEnvPath = path.join(rootDir, "packages", "app", ".env")
  if (!fs.existsSync(appEnvPath) && fs.existsSync(path.join(rootDir, "packages", "app", ".env.example"))) {
    fs.copyFileSync(path.join(rootDir, "packages", "app", ".env.example"), appEnvPath)
    logger.log(chalk.gray("Created .env for app"))
  } else logger.log(chalk.gray("Skipping .env for app"))
  // Landing
  const landingEnvPath = path.join(rootDir, "packages", "landing", ".env")
  if (!fs.existsSync(landingEnvPath) && fs.existsSync(path.join(rootDir, "packages", "landing", ".env.example"))) {
    fs.copyFileSync(path.join(rootDir, "packages", "landing", ".env.example"), landingEnvPath)
    logger.log(chalk.gray("Created .env for landing"))
  } else logger.log(chalk.gray("Skipping .env for landing"))
  // Cron
  const cronEnvPath = path.join(rootDir, "packages", "cron", ".env")
  if (!fs.existsSync(cronEnvPath) && fs.existsSync(path.join(rootDir, "packages", "cron", ".env.example"))) {
    fs.copyFileSync(path.join(rootDir, "packages", "cron", ".env.example"), cronEnvPath)
    logger.log(chalk.gray("Created .env for cron"))
  } else logger.log(chalk.gray("Skipping .env for cron"))

  if (initDb) {
    //* Initialize the database
    const appPath = path.join(rootDir, "packages", "app")
    logger.log(chalk.blue("Initializing the database..."))
    if (!fs.existsSync(appPath)) {
      logger.log(chalk.gray("Skipping database initialization (no app folder)"))
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
}
