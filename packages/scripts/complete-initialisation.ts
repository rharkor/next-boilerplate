import chalk from "chalk"
import { execSync } from "child_process"
import * as fs from "fs/promises"
import * as path from "path"
import * as url from "url"

import { logger } from "@next-boilerplate/lib"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

export const completeInitialisation = async () => {
  // Linting and formatting
  logger.log(chalk.blue("Linting and formatting..."))
  execSync("npm run lint:fix", {
    cwd: path.join(rootPath, ".."),
    stdio: "inherit",
  })
  execSync("npm run prettier:fix", {
    cwd: path.join(rootPath, ".."),
    stdio: "inherit",
  })
  logger.log(chalk.green("Done!"))

  // eslint-disable-next-line no-process-env
  if (process.env.SKIP_INIT_CHECK !== "true") {
    await fs.unlink(path.join(rootPath, "scripts", ".init-todo")).catch(() => {})
    // logger.log("\n")
    // logger.log(chalk.yellow("*".repeat(50)))
    // logger.log(chalk.green("Project initialized!"))
    // logger.log(chalk.red("Don't forget to change the license for production"))
    // logger.log(chalk.yellow("*".repeat(50)))
  } else logger.log(chalk.yellow("Skipping completeInitialisation()"))
}
