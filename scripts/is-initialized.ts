import chalk from "chalk"
import * as fs from "fs/promises"
import * as path from "path"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

try {
  await fs.access(path.join(rootPath, "scripts", ".init-todo"))
  console.log(chalk.red("Project not initialized!"))
  console.log(chalk.yellow("Run `npm run init` to initialize the project"))
  process.exit(1)
} catch {
  // Do nothing
}
