#!/usr/bin/env zx

/**
 * Validate the config of each templates
 */

import { $ } from "zx"

import { input } from "@inquirer/prompts"
import {
  componentConfigSchema,
  configSchema,
  TComponentConfig,
  TConfig,
} from "@next-boilerplate/scripts/utils/template-config"
import { logger, task } from "@rharkor/logger"

import "zx/globals"

const dir = $.sync`pwd`.text().replace("\n", "")

const componentsDirectory = path.join(dir, "assets", "components")
const configFileName = "config.json"

export const applyConfig = async () => {
  //* Root dir
  let root = argv.root as string
  if (!root) {
    try {
      root = await input({
        message: "What is the root directory?",
        default: ".",
      })
    } catch {
      process.exit(0)
    }
  }

  const applyConfigTask = await task.startTask({
    name: "Apply template config... 🧰",
  })

  //* Retrieve config
  applyConfigTask.print("Retrieving the config")
  const configPath = !root.endsWith(configFileName) ? path.join(root, configFileName) : root
  if (!(await fs.exists(configPath))) {
    applyConfigTask.error(`The config file ${configPath} doesn't exist`)
    applyConfigTask.stop()
    process.exit(1)
  }

  const config = (await fs.readJson(configPath)) as TConfig
  try {
    configSchema.parse(config)
  } catch (error) {
    applyConfigTask.error(`The config file ${configPath} is not valid`)
    applyConfigTask.stop()
    logger.error(error)
    process.exit(1)
  }

  //* Apply plugins
  applyConfigTask.print("Applying plugins")

  for (const reference of config.plugins) {
    const componentName = typeof reference === "string" ? reference : reference.name
    const componentPath = path.join(componentsDirectory, componentName)
    if (!(await fs.exists(componentPath))) {
      applyConfigTask.error(`The component ${componentName} referenced by the config doesn't exist`)
      applyConfigTask.stop()
      process.exit(1)
    }
    const componentConfigPath = path.join(componentPath, configFileName)
    const componentContentName = (await fs.readdir(componentPath)).find((file) => file.startsWith("index"))
    if (!componentContentName) {
      applyConfigTask.error(`The component ${componentName} referenced by the config doesn't exist`)
      applyConfigTask.stop()
      process.exit(1)
    }
    const componentContentPath = path.join(componentPath, componentContentName)
    const componentConfig = (await fs.readJson(componentConfigPath)) as TComponentConfig
    try {
      componentConfigSchema.parse(componentConfig)
    } catch (error) {
      applyConfigTask.error(`The component config file ${componentConfigPath} is not valid`)
      applyConfigTask.stop()
      logger.error(error)
      process.exit(1)
    }

    //? Check if the component exists
    if (!componentContentPath || !(await fs.exists(componentContentPath))) {
      applyConfigTask.error(`The component ${componentName} referenced by the config doesn't exist`)
      applyConfigTask.stop()
      process.exit(1)
    }

    const relativeDestinationPath = typeof reference === "string" ? componentConfig.suggestedPath : reference.path

    // Verify if the template doesnt exist
    const destinationPath = path.join(root, relativeDestinationPath)
    if (await fs.exists(destinationPath)) {
      applyConfigTask.error(`A file/folder already exists at the destination ${destinationPath}`)
      applyConfigTask.stop()
      process.exit(1)
    }

    applyConfigTask.print(`Copying the component ${componentName} to the destination ${destinationPath}`)
    await fs.copy(componentContentPath, destinationPath)
  }

  //* Delete config.json
  applyConfigTask.print("Deleting the config file")
  await fs.remove(configPath)

  applyConfigTask.stop("The template config has been applied! 🎉")
}
