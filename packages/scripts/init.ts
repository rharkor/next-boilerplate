import chalk from "chalk"
import { config } from "dotenv"
import { envSetup } from "env-setup"
import * as fs from "fs/promises"
import { exit } from "node:process"
import { packagesSelection } from "packages-selection"
import * as path from "path"
import { replaceTokens } from "replace-tokens"
import { runtime } from "runtime"
import * as url from "url"

import { logger } from "@lib/logger"

import { completeInitialisation } from "./complete-initialisation"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

config()

async function main() {
  const alreadyInitialized = await fs
    .access(path.join(rootPath, "scripts", ".init-todo"))
    .then(() => false)
    .catch(() => true)

  if (!alreadyInitialized) {
    logger.log(chalk.green("Welcome to the init script!"))
    logger.log(chalk.blue('Starting the "replace tokens" script...'))
    await replaceTokens()
    logger.log(chalk.green("Done!"))
  } else {
    logger.log(chalk.yellow("Skipping replaceTokens()"))
  }

  if (!alreadyInitialized) {
    logger.log(chalk.blue('Starting the "runtime" script...'))
    await runtime()
    logger.log(chalk.green("Done!"))
  } else {
    logger.log(chalk.gray("Skipping runtime()"))
  }

  if (!alreadyInitialized) {
    logger.log(chalk.blue('Starting the "packages selection" script...'))
    await packagesSelection()
    logger.log(chalk.green("Done!"))
  } else {
    logger.log(chalk.gray("Skipping packagesSelection()"))
  }

  logger.log(chalk.blue('Starting the "env setup" script...'))
  await envSetup()
  logger.log(chalk.green("Done!"))

  if (process.env.SKIP_INIT_CHECK !== "true") await completeInitialisation()
  else logger.log(chalk.yellow("Skipping completeInitialisation()"))
  exit(0)
}

main()
