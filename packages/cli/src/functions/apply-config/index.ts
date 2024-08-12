/**
 * Validate the config of each templates
 */

import fs from "fs-extra"
import minimist from "minimist"
import path from "path"
import { fileURLToPath } from "url"

import { input } from "@inquirer/prompts"
import {
  configSchema,
  pluginConfigSchema,
  TConfig,
  TPluginConfig,
} from "@next-boilerplate/scripts/utils/template-config"
import { logger } from "@rharkor/logger"
import { task } from "@rharkor/task"

// Get the current package directory
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory
const dir = path.resolve(__dirname, "../../..")

const pluginsDirectory = path.join(dir, "assets", "plugins")
const configFileName = "config.json"

const argv = minimist(process.argv.slice(2))

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

  //* Check if the plugins directory exists
  applyConfigTask.log("Checking if the plugins directory exists")
  if (!(await fs.exists(pluginsDirectory))) {
    applyConfigTask.error(`The plugins directory doesn't exist at ${pluginsDirectory}`)
    applyConfigTask.stop()
    process.exit(1)
  }

  //* Retrieve config
  applyConfigTask.log("Retrieving the config")
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
  applyConfigTask.log("Applying plugins")

  for (const plugin of config.plugins) {
    const pluginName = typeof plugin === "string" ? plugin : plugin.name
    const pluginPath = path.join(pluginsDirectory, pluginName)
    if (!(await fs.exists(pluginPath))) {
      applyConfigTask.error(`The plugin ${pluginName} doesn't exist`)
      applyConfigTask.stop()
      process.exit(1)
    }
    const pluginConfigPath = path.join(pluginPath, configFileName)
    const pluginContentName = (await fs.readdir(pluginPath)).find((file) => file.startsWith("index"))
    if (!pluginContentName) {
      applyConfigTask.error(`The plugin ${pluginName} doesn't exist`)
      applyConfigTask.stop()
      process.exit(1)
    }
    const pluginContentPath = path.join(pluginPath, pluginContentName)
    const pluginConfig = (await fs.readJson(pluginConfigPath)) as TPluginConfig
    try {
      pluginConfigSchema.parse(pluginConfig)
    } catch (error) {
      applyConfigTask.error(`The plugin config file ${pluginConfigPath} is not valid. Contact developer`)
      applyConfigTask.stop()
      logger.error(error)
      process.exit(1)
    }

    //? Check if the plugin exists
    if (!pluginContentPath || !(await fs.exists(pluginContentPath))) {
      applyConfigTask.error(`The plugin ${pluginName} doesn't exist`)
      applyConfigTask.stop()
      process.exit(1)
    }

    const relativeDestinationPath =
      typeof plugin === "string" ? pluginConfig.suggestedPath : plugin.path || pluginConfig.suggestedPath

    // Verify if the template doesnt exist
    const destinationPath = path.join(root, relativeDestinationPath)
    if (await fs.exists(destinationPath)) {
      applyConfigTask.error(`A file/folder already exists at the destination ${destinationPath}`)
      applyConfigTask.stop()
      process.exit(1)
    }

    applyConfigTask.log(`Copying the plugin ${pluginName} to the destination ${destinationPath}`)
    await fs.copy(pluginContentPath, destinationPath)
  }

  //* Delete config.json
  applyConfigTask.log("Deleting the config file")
  await fs.remove(configPath)

  applyConfigTask.stop("The template config has been applied! 🎉")
}
