/**
 * This script will initialize the environment variables
 */

import chalk from "chalk"
import * as fs from "fs"
import * as path from "path"
import * as url from "url"

import { logger } from "@next-boilerplate/lib"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootDir = path.join(__dirname, "..", "..")
export const envSetup = async () => {
  //* Copy the .env.example to .env for
  // App
  const appEnvPath = path.join(rootDir, "apps", "app", ".env")
  if (!fs.existsSync(appEnvPath) && fs.existsSync(path.join(rootDir, "apps", "app", ".env.example"))) {
    fs.copyFileSync(path.join(rootDir, "apps", "app", ".env.example"), appEnvPath)
    logger.log(chalk.gray("Created .env for app"))
  } else logger.log(chalk.gray("Skipping .env for app"))
  // Landing
  const landingEnvPath = path.join(rootDir, "apps", "landing", ".env")
  if (!fs.existsSync(landingEnvPath) && fs.existsSync(path.join(rootDir, "apps", "landing", ".env.example"))) {
    fs.copyFileSync(path.join(rootDir, "apps", "landing", ".env.example"), landingEnvPath)
    logger.log(chalk.gray("Created .env for landing"))
  } else logger.log(chalk.gray("Skipping .env for landing"))
  // Cron
  const cronEnvPath = path.join(rootDir, "apps", "cron", ".env")
  if (!fs.existsSync(cronEnvPath) && fs.existsSync(path.join(rootDir, "apps", "cron", ".env.example"))) {
    fs.copyFileSync(path.join(rootDir, "apps", "cron", ".env.example"), cronEnvPath)
    logger.log(chalk.gray("Created .env for cron"))
  } else logger.log(chalk.gray("Skipping .env for cron"))
}
