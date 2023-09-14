import chalk from "chalk"
import { exit } from "node:process"
import { replaceTokens } from "./replace-tokens"

async function main() {
  console.log(chalk.green("Welcome to the init script!"))
  console.log(chalk.blue(' Starting the "replace tokens" script...'))
  await replaceTokens()
  console.log(chalk.green("Done!"))

  console.log("\n")
  console.log(chalk.yellow("*".repeat(50)))
  console.log(chalk.green("Project initialized!"))
  console.log(chalk.red("Don't forget to change the license for production"))
  console.log(chalk.yellow("*".repeat(50)))
  exit(0)
}

main()
