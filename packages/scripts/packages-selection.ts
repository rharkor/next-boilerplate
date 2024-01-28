/**
 * This script remove all the packages you don't want from the monorepo
 */

import chalk from "chalk"
import * as fs from "fs"
import inquirer from "inquirer"
import * as path from "path"
import * as url from "url"
import YAML from "yaml"

import { logger } from "@lib/logger"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootDir = path.join(__dirname, "..", "..")

const packagesAvailable = fs.readdirSync(path.join(rootDir, "packages")).filter((p) => p !== "scripts" && p !== "lib")
const dockerComposePaths = [
  path.join(rootDir, "docker", "docker-compose.yml"),
  path.join(rootDir, "docker", "docker-compose.local.yml"),
]

export const packagesSelection = async () => {
  const { packages } = await inquirer.prompt<{ packages: string[] }>([
    {
      type: "checkbox",
      name: "packages",
      message: "Unselect the packages you don't want to use:",
      choices: packagesAvailable,
      default: packagesAvailable,
    },
  ])

  const packagesToRemove = packagesAvailable.filter((p) => !packages.includes(p))

  if (packagesToRemove.length === 0) {
    logger.log(chalk.gray("No packages to remove!"))
    return
  }

  logger.log(chalk.blue("Removing packages..."))
  for (const packageToRemove of packagesToRemove) {
    //? Remove the package folder
    await fs.promises.rm(path.join(rootDir, "packages", packageToRemove), { recursive: true })
    //? Remove from the workspace in the root package.json
    const rootPackageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json")).toString())
    rootPackageJson.workspaces = rootPackageJson.workspaces.filter(
      (w: string) => !w.includes(`packages/${packageToRemove}`)
    )
    fs.writeFileSync(path.join(rootDir, "package.json"), JSON.stringify(rootPackageJson, null, 2))
    logger.log(chalk.gray(`Removed ${packageToRemove}!`))
  }
  // Remove the docker-compose services that are not needed anymore
  for (const dockerComposePath of dockerComposePaths) {
    const dockerCompose = fs.readFileSync(dockerComposePath).toString()
    const dockerComposeYaml = YAML.parse(dockerCompose)
    for (const packageToRemove of packagesToRemove) {
      delete dockerComposeYaml.services[packageToRemove]
    }
    fs.writeFileSync(dockerComposePath, YAML.stringify(dockerComposeYaml))
  }
  logger.log(chalk.gray("Removed docker-compose services!"))
}
