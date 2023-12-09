import chalk from "chalk"
import { envSetup } from "env-setup"
import { exit } from "node:process"

async function main() {
  console.log(chalk.blue('Starting the "env setup" script...'))
  await envSetup(false)
  console.log(chalk.green("Done!"))
  exit(0)
}

main()
