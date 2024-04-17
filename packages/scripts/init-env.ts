import chalk from "chalk"
import { envSetup } from "env-setup"
import { exit } from "node:process"

import { logger } from "@next-boilerplate/lib"

async function main() {
  logger.log(chalk.blue('Starting the "env setup" script...'))
  await envSetup()
  logger.log(chalk.green("Done!"))
  exit(0)
}

main()
