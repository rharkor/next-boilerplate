import chalk from "chalk"
import { envSetup } from "env-setup"
import { exit } from "node:process"

import { logger } from "@lib/logger"

async function main() {
  logger.log(chalk.blue('Starting the "env setup" script...'))
  await envSetup(false)
  logger.log(chalk.green("Done!"))
  exit(0)
}

main()
