import chalk from "chalk"
import * as fs from "fs/promises"
import inquirer from "inquirer"
import * as path from "path"
import * as url from "url"

import { logger } from "@lib/logger"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const root = path.join(__dirname, "..")

export type IRuntime = {
  npm: string
  npx: string
}

const basicFiles = [
  {
    path: "../package.json",
    replace: (oldRuntime: IRuntime, newRuntime: IRuntime, content: string) => {
      if (oldRuntime.npm === "npm" && newRuntime.npm !== "npm") {
        content = content.replaceAll(
          `only-allow-many ${oldRuntime.npm}`,
          `only-allow-many ${newRuntime.npm} ${oldRuntime.npm}`
        )
      } else {
        content = content.replaceAll(`only-allow-many ${oldRuntime.npm} npm`, `only-allow-many ${newRuntime.npm}`)
      }
      return content
    },
  },
  {
    path: "../README.md",
    replace: (oldRuntime: IRuntime, newRuntime: IRuntime, content: string) => {
      return content.replaceAll(`${oldRuntime.npm} `, `${newRuntime.npm} `)
    },
  },
  {
    path: "../.devcontainer/devcontainer.json",
    replace: (oldRuntime: IRuntime, newRuntime: IRuntime, content: string) => {
      return content.replaceAll(`${oldRuntime.npm} `, `${newRuntime.npm} `)
    },
  },
  {
    path: "../.github/workflows/check.yml",
    replace: (oldRuntime: IRuntime, newRuntime: IRuntime, content: string) => {
      if (oldRuntime.npm === "npm" && newRuntime.npm === "bun") {
        content = content.replaceAll(`${oldRuntime.npm} install`, `${newRuntime.npm} install`)
      } else if (oldRuntime.npm === "bun" && newRuntime.npm === "npm") {
        content = content.replaceAll(`${oldRuntime.npm} install`, `${newRuntime.npm} install`)
      }
      content = content.replaceAll(`${oldRuntime.npm} `, `${newRuntime.npm} `)
      if (oldRuntime.npm === "npm" && newRuntime.npm === "bun") {
        content = content.replaceAll(
          `      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"
          cache: "npm"`,
          `      - name: Install bun
        uses: oven-sh/setup-bun@v1`
        )
      } else if (oldRuntime.npm === "bun" && newRuntime.npm === "npm") {
        content = content.replaceAll(
          `      - name: Install bun
        uses: oven-sh/setup-bun@v1`,
          `      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"
          cache: "npm"`
        )
      }
      return content
    },
  },
  {
    path: "../.github/workflows/release.yml",
    replace: (oldRuntime: IRuntime, newRuntime: IRuntime, content: string) => {
      if (oldRuntime.npm === "npm" && newRuntime.npm === "bun") {
        content = content.replaceAll(`${oldRuntime.npm} install`, `${newRuntime.npm} install`)
        content = content.replaceAll(
          `      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "lts/*"`,
          `      - name: Install bun
        uses: oven-sh/setup-bun@v1`
        )
      } else if (oldRuntime.npm === "bun" && newRuntime.npm === "npm") {
        content = content.replaceAll(`${oldRuntime.npm} install`, `${newRuntime.npm} install`)
        content = content.replaceAll(
          `      - name: Install bun
        uses: oven-sh/setup-bun@v1`,
          `      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "lts/*"`
        )
      }
      return content.replaceAll(`${oldRuntime.npx} `, `${newRuntime.npx} `)
    },
  },
]

const processBasicFiles = async (currentRuntime: IRuntime, newRuntime: IRuntime) => {
  for (const file of basicFiles) {
    const filePath = path.join(root, file.path)
    const fileContent = await fs.readFile(filePath, "utf8")
    const newFileContent = file.replace(currentRuntime, newRuntime, fileContent)
    await fs.writeFile(filePath, newFileContent, "utf8")
    logger.log(chalk.gray(`Done for ${filePath}`))
  }
}

export const runtime = async () => {
  const projectInfo = await fs.readFile(path.join(root, "scripts", ".pinfo.json"), "utf8")
  const projectInfoJson = JSON.parse(projectInfo) as { runtime: IRuntime }
  const currentRuntime = projectInfoJson.runtime
  //? Ask for the runtime
  const res = await inquirer.prompt([
    {
      type: "list",
      name: "runtime",
      message: `What runtime do you want to use? (current: ${currentRuntime.npm})`,
      choices: ["node (npm)", "bun"],
    },
  ])

  //? If the runtime is the same, do nothing
  if (res.runtime === "node (npm)") {
    logger.log(chalk.gray(`No change`))
    return
  }

  //? Replace the runtime
  const newRuntime = res.runtime === "node (npm)" ? { npm: "npm", npx: "npx" } : { npm: "bun", npx: "bunx" }
  await processBasicFiles(currentRuntime, newRuntime)

  //? Delete old node_modules
  logger.log(chalk.blue(`Deleting old node_modules`))
  await fs.rm(path.join(root, "../node_modules"), { recursive: true, force: true })

  //? Save the new runtime
  projectInfoJson.runtime = newRuntime
  await fs.writeFile(path.join(root, "scripts", ".pinfo.json"), JSON.stringify(projectInfoJson, null, 2) + "\n", "utf8")
  logger.log(chalk.gray(`Done for .pinfo.json`))
}
