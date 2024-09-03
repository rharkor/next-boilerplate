import fs from "fs-extra"

import { logger } from "@rharkor/logger"
import { task } from "@rharkor/task"

import { configSchema, pluginConfigSchema, TConfig, TPluginConfig } from "."

export const applyConfigurationTask = async ({
  configFileName,
  pluginsDirectory,
  root,
}: {
  pluginsDirectory: string
  configFileName: string
  root: string
}) => {
  const applyConfigTask = await task.startTask({
    name: "Apply template config... 🧰",
  })

  //* Check if the plugins directory exists
  applyConfigTask.log("Checking if the plugins directory exists")
  if (!(await fs.exists(pluginsDirectory))) {
    applyConfigTask.error(`The plugins directory doesn't exist at ${pluginsDirectory}`)
    applyConfigTask.stop()
    throw new Error(`The plugins directory doesn't exist at ${pluginsDirectory}`)
  }

  //* Retrieve config
  applyConfigTask.log("Retrieving the config")
  const configPath = !root.endsWith(configFileName) ? path.join(root, configFileName) : root
  if (!(await fs.exists(configPath))) {
    applyConfigTask.error(`The config file ${configPath} doesn't exist`)
    applyConfigTask.stop()
    throw new Error(`The config file ${configPath} doesn't exist`)
  }

  const config = (await fs.readJson(configPath)) as TConfig
  try {
    configSchema.parse(config)
  } catch (error) {
    applyConfigTask.error(`The config file ${configPath} is not valid`)
    applyConfigTask.stop()
    logger.error(error)
    throw error
  }

  //* Apply plugins
  applyConfigTask.log("Applying plugins")

  for (const plugin of config.plugins) {
    const pluginName = typeof plugin === "string" ? plugin : plugin.name
    const pluginPath = path.join(pluginsDirectory, pluginName)
    if (!(await fs.exists(pluginPath))) {
      applyConfigTask.error(`The plugin ${pluginName} doesn't exist`)
      applyConfigTask.stop()
      throw new Error(`The plugin ${pluginName} doesn't exist`)
    }
    const pluginConfigPath = path.join(pluginPath, configFileName)
    const pluginContentName = (await fs.readdir(pluginPath)).find((file) => file.startsWith("index"))
    if (!pluginContentName) {
      applyConfigTask.error(`The plugin ${pluginName} doesn't exist`)
      applyConfigTask.stop()
      throw new Error(`The plugin ${pluginName} doesn't exist`)
    }
    const pluginContentPath = path.join(pluginPath, pluginContentName)
    const pluginConfig = (await fs.readJson(pluginConfigPath)) as TPluginConfig
    try {
      pluginConfigSchema.parse(pluginConfig)
    } catch (error) {
      applyConfigTask.error(`The plugin config file ${pluginConfigPath} is not valid. Contact developer`)
      applyConfigTask.stop()
      logger.error(error)
      throw error
    }

    //? Check if the plugin exists
    if (!pluginContentPath || !(await fs.exists(pluginContentPath))) {
      applyConfigTask.error(`The plugin ${pluginName} doesn't exist`)
      applyConfigTask.stop()
      throw new Error(`The plugin ${pluginName} doesn't exist`)
    }

    const relativeDestinationPaths = pluginConfig.paths.map((p) => p.to)

    // Verify if the template doesnt already exist
    for (const relativeDestinationPath of relativeDestinationPaths) {
      const destinationPath = path.join(root, relativeDestinationPath)
      if (await fs.exists(destinationPath)) {
        applyConfigTask.error(`A file/folder already exists at the destination ${destinationPath}`)
        applyConfigTask.stop()
        throw new Error(`A file/folder already exists at the destination ${destinationPath}`)
      }
    }

    // Copy the plugin to the destination
    for (const relativeDestinationPath of relativeDestinationPaths) {
      const destinationPath = path.join(root, relativeDestinationPath)
      applyConfigTask.log(`Copying the plugin ${pluginName} to the destination ${destinationPath}`)
      await fs.copy(pluginContentPath, destinationPath)
    }
  }

  //* Delete config.json
  applyConfigTask.log("Deleting the config file")
  await fs.remove(configPath)

  applyConfigTask.stop("The template config has been applied! 🎉")
}
