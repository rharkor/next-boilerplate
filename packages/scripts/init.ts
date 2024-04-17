import chalk from "chalk"
import { config } from "dotenv"
import * as fs from "fs/promises"
import { exit } from "node:process"
import * as path from "path"
import * as url from "url"

import { logger } from "@next-boilerplate/lib"

import { completeInitialisation } from "./complete-initialisation"
import { dbSetup } from "./db-setup"
import { modulesSelection } from "./modules-selection"
import { packagesSelection } from "./packages-selection"
import { replaceTokens } from "./replace-tokens"

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
  }

  if (!alreadyInitialized) {
    logger.log(chalk.blue('Starting the "modules selection" script...'))
    await modulesSelection()
    logger.log(chalk.green("Done!"))
  } else {
    logger.log(chalk.gray("Skipping modulesSelection()"))
  }

  if (!alreadyInitialized) {
    logger.log(chalk.blue('Starting the "replace tokens" script...'))
    await replaceTokens()
    logger.log(chalk.green("Done!"))
  } else {
    logger.log(chalk.gray("Skipping replaceTokens()"))
  }

  if (!alreadyInitialized) {
    logger.log(chalk.blue('Starting the "packages selection" script...'))
    await packagesSelection()
    logger.log(chalk.green("Done!"))
  } else {
    logger.log(chalk.gray("Skipping packagesSelection()"))
  }

  logger.log(chalk.blue('Starting the "db setup" script...'))
  await dbSetup()
  logger.log(chalk.green("Done!"))

  logger.log(chalk.blue('Starting the "complete initialisation" script...'))
  await completeInitialisation()

  exit(0)
}

main()
