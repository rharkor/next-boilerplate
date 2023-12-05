import chalk from "chalk"
import { config } from "dotenv"
import * as fs from "fs/promises"
import { exit } from "node:process"
import * as path from "path"
import * as url from "url"
import { completeInitialisation } from "./complete-initialisation"
import { replaceTokens } from "./replace-tokens"
import { runtime } from "./runtime"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

config({ path: path.join(rootPath, ".env") })

async function main() {
  const alreadyInitialized = await fs.access(path.join(rootPath, "scripts", ".init-todo")).catch(() => false)
  if (alreadyInitialized) {
    console.log(chalk.red("Project already initialized!"))
    exit(1)
  }

  console.log(chalk.green("Welcome to the init script!"))
  console.log(chalk.blue(' Starting the "replace tokens" script...'))
  await replaceTokens()
  console.log(chalk.green("Done!"))

  console.log(chalk.blue(' Starting the "runtime" script...'))
  await runtime()
  console.log(chalk.green("Done!"))

  if (process.env.SKIP_INIT_CHECK !== "true") await completeInitialisation()
  else console.log(chalk.yellow("Skipping completeInitialisation()"))
  exit(0)
}

main()
