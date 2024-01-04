import chalk from "chalk"
import * as fs from "fs/promises"
import * as path from "path"
import * as url from "url"

import { logger } from "@lib/logger"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

export const completeInitialisation = async () => {
  await fs.unlink(path.join(rootPath, "scripts", ".init-todo")).catch(() => {})
  logger.log("\n")
  logger.log(chalk.yellow("*".repeat(50)))
  logger.log(chalk.green("Project initialized!"))
  logger.log(chalk.red("Don't forget to change the license for production"))
  logger.log(chalk.yellow("*".repeat(50)))
}
