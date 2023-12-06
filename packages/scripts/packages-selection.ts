/**
 * This script remove all the packages you don't want from the monorepo
 */

import chalk from "chalk"
import * as fs from "fs"
import inquirer from "inquirer"
import * as path from "path"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const packagesAvailable = fs.readdirSync(path.join(__dirname, "..", "packages"))

export const packagesSelection = async () => {
  const { packages } = await inquirer.prompt<{ packages: string[] }>([
    {
      type: "checkbox",
      name: "packages",
      message: "Select the packages you want to keep",
      choices: packagesAvailable,
      default: packagesAvailable,
    },
  ])

  const packagesToRemove = packagesAvailable.filter((p) => !packages.includes(p))

  if (packagesToRemove.length === 0) {
    console.log(chalk.green("No packages to remove!"))
    return
  }

  console.log(chalk.blue("Removing packages..."))
  for (const packageToRemove of packagesToRemove) {
    //? Remove the package folder
    await fs.promises.rm(path.join(__dirname, "..", "packages", packageToRemove), { recursive: true })
    //? Remove from the workspace in the root package.json
    const rootPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json")).toString())
    delete rootPackageJson.workspaces.packages[packageToRemove]
    fs.writeFileSync(path.join(__dirname, "..", "package.json"), JSON.stringify(rootPackageJson, null, 2))
    console.log(chalk.green(`- Removed ${packageToRemove}!`))
  }
  console.log(chalk.green("Done!"))
}
