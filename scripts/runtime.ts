import chalk from "chalk"
import inquirer from "inquirer"
import * as fs from "fs/promises"
// import { stdin as input, stdout as output } from "node:process"
// import * as readline from "node:readline/promises"
import * as path from "path"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const root = path.join(__dirname, "..")

type IRuntime = {
  npm: string
  npx: string
}

const packageFilesToCheck = [path.join(root, "package.json"), path.join(root, "scripts", "package.json")]
const basicFiles = [
  {
    path: "README.md",
    replace: (oldRuntime: IRuntime, newRuntime: IRuntime, content: string) => {
      return content.replaceAll(`${oldRuntime.npm} `, `${newRuntime.npm} `)
    },
  },
  {
    path: ".devcontainer/devcontainer.json",
    replace: (oldRuntime: IRuntime, newRuntime: IRuntime, content: string) => {
      return content.replaceAll(`${oldRuntime.npm} `, `${newRuntime.npm} `)
    },
  },
]

const processPackageFile = async (currentRuntime: IRuntime, newRuntime: IRuntime) => {
  for (const file of packageFilesToCheck) {
    const fileContent = await fs.readFile(file, "utf8")
    const packageJson = JSON.parse(fileContent) as { scripts: Record<string, string> }
    //? Replace all npm by bun in scripts
    const scripts = packageJson.scripts
    for (const script in scripts) {
      scripts[script] = scripts[script].replaceAll(currentRuntime.npm, newRuntime.npm)
      scripts[script] = scripts[script].replaceAll(currentRuntime.npx, newRuntime.npx)
    }
    //? Save the package.json
    await fs.writeFile(file, JSON.stringify(packageJson, null, 2) + "\n", "utf8")
    chalk.blue(`Done for ${file}`)
  }
}

const processBasicFiles = async (currentRuntime: IRuntime, newRuntime: IRuntime) => {
  for (const file of basicFiles) {
    const filePath = path.join(root, file.path)
    const fileContent = await fs.readFile(filePath, "utf8")
    const newFileContent = file.replace(currentRuntime, newRuntime, fileContent)
    await fs.writeFile(filePath, newFileContent, "utf8")
    chalk.blue(`Done for ${filePath}`)
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
      message: "What runtime do you want to use?",
      choices: ["node (npm)", "bun"],
    },
  ])

  //? Replace the runtime
  const newRuntime = res.runtime === "node (npm)" ? { npm: "npm", npx: "npx" } : { npm: "bun", npx: "bunx" }
  await processPackageFile(currentRuntime, newRuntime)
  await processBasicFiles(currentRuntime, newRuntime)
}
