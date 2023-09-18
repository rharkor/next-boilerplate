import chalk from "chalk"
import { exit } from "node:process"
import { completeInitialisation } from "./complete-initialisation"
import { replaceTokens } from "./replace-tokens"

async function main() {
  console.log(chalk.green("Welcome to the init script!"))
  console.log(chalk.blue(' Starting the "replace tokens" script...'))
  await replaceTokens()
  console.log(chalk.green("Done!"))

  await completeInitialisation()
  exit(0)
}

main()
