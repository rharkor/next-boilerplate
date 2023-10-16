import chalk from "chalk"
import * as fs from "fs/promises"
import * as path from "path"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

export const completeInitialisation = async () => {
  await fs.unlink(path.join(rootPath, "scripts", ".init-todo")).catch(() => {})
  console.log("\n")
  console.log(chalk.yellow("*".repeat(50)))
  console.log(chalk.green("Project initialized!"))
  console.log(chalk.red("Don't forget to change the license for production"))
  console.log(chalk.yellow("*".repeat(50)))
}
