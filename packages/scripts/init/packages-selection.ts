/**
 * This script remove all the packages you don't want from the monorepo
 */

import * as fs from "fs"
import inquirer from "inquirer"
import * as path from "path"
import YAML from "yaml"

import { startTask } from "./utils/cmd"
import { getPath } from "./utils/path"

const rootDir = getPath()

const packagesAvailable = fs
  .readdirSync(path.join(rootDir, "packages"))
  .filter((p) => p !== "scripts" && p !== "lib" && p !== "configs")
  .map((p) => path.join("packages", p))
  .concat(fs.readdirSync(path.join(rootDir, "apps")).map((p) => path.join("apps", p)))
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
    return
  }

  const task = startTask({
    name: "Removing packages",
    successMessage: "Packages removed",
  })
  for (const packageToRemove of packagesToRemove) {
    //? Remove the package folder
    await fs.promises.rm(path.join(rootDir, packageToRemove), {
      recursive: true,
    })
    //? Remove from the workspace in the root package.json
    const rootPackageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json")).toString())
    rootPackageJson.workspaces = rootPackageJson.workspaces.filter((w: string) => !w.includes(packageToRemove))
    fs.writeFileSync(path.join(rootDir, "package.json"), JSON.stringify(rootPackageJson, null, 2))
    task.print(`Removed ${packageToRemove}!`)
  }
  // Remove the docker-compose services that are not needed anymore
  for (const dockerComposePath of dockerComposePaths) {
    const dockerCompose = fs.readFileSync(dockerComposePath).toString()
    const dockerComposeYaml = YAML.parse(dockerCompose)
    for (const packageToRemove of packagesToRemove) {
      delete dockerComposeYaml.services[packageToRemove]
      task.print(`Removed services from ${dockerComposePath}!`)
    }
    fs.writeFileSync(dockerComposePath, YAML.stringify(dockerComposeYaml))
  }

  task.stop()
}
