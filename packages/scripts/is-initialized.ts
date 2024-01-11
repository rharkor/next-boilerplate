import chalk from "chalk"
import { config } from "dotenv"
import * as fs from "fs/promises"
import * as path from "path"
import * as url from "url"

import { logger } from "@lib/logger"

import { IRuntime } from "./runtime"
const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

config()

if (process.env.SKIP_INIT_CHECK === "true") process.exit(0)

const main = async () => {
  try {
    await fs.access(path.join(rootPath, "scripts", ".init-todo"))
    const projectInfo = await fs.readFile(path.join(rootPath, "scripts", ".pinfo.json"), "utf8")
    const projectInfoJson = JSON.parse(projectInfo) as { runtime: IRuntime }
    const currentRuntime = projectInfoJson.runtime
    logger.log(chalk.red("Project not initialized!"))
    logger.log(chalk.yellow(`Run \`${currentRuntime.npm} run init\` to initialize the project`))
    process.exit(1)
  } catch {
    // Do nothing
  }
}

main()
