import fs from "fs-extra"
import path from "path"

import { logger } from "@rharkor/logger"
import { task } from "@rharkor/task"

import { configSchema, pluginConfigSchema, TConfig, TPluginConfig } from "."

export const applyConfigurationTask = async ({
  configFileName,
  pluginsDirectory,
  root,
  noTask,
}: {
  pluginsDirectory: string
  configFileName: string
  root: string
  noTask: boolean
}) => {
  let applyConfigTask: null | Awaited<ReturnType<(typeof task)["startTask"]>> = null
  if (!noTask) {
    applyConfigTask = await task.startTask({
      name: "Apply template config... 🧰",
    })
  }

  //* Check if the plugins directory exists
  if (applyConfigTask) applyConfigTask.log("Checking if the plugins directory exists")
  else logger.info("Checking if the plugins directory exists")
  if (!(await fs.exists(pluginsDirectory))) {
    if (applyConfigTask) applyConfigTask.error(`The plugins directory doesn't exist at ${pluginsDirectory}`)
    else logger.error(`The plugins directory doesn't exist at ${pluginsDirectory}`)
    applyConfigTask?.stop()
    throw new Error(`The plugins directory doesn't exist at ${pluginsDirectory}`)
  }

  //* Retrieve config
  if (applyConfigTask) applyConfigTask.log("Retrieving the config")
  else logger.info("Retrieving the config")
  const configPath = !root.endsWith(configFileName) ? path.join(root, configFileName) : root
  if (!(await fs.exists(configPath))) {
    if (applyConfigTask) applyConfigTask.error(`The config file ${configPath} doesn't exist`)
    else logger.error(`The config file ${configPath} doesn't exist`)
    applyConfigTask?.stop()
    throw new Error(`The config file ${configPath} doesn't exist`)
  }

  const config = (await fs.readJson(configPath)) as TConfig
  try {
    configSchema.parse(config)
  } catch (error) {
    if (applyConfigTask) applyConfigTask.error(`The config file ${configPath} is not valid`)
    else logger.error(`The config file ${configPath} is not valid`)
    applyConfigTask?.stop()
    logger.error(error)
    throw error
  }

  //* Verify plugins
  if (applyConfigTask) applyConfigTask.log("Applying plugins")
  else logger.info("Applying plugins")

  for (const plugin of config.plugins) {
    const pluginName = typeof plugin === "string" ? plugin : plugin.name
    const pluginPath = path.join(pluginsDirectory, pluginName)
    if (!(await fs.exists(pluginPath))) {
      if (applyConfigTask) applyConfigTask.error(`The plugin ${pluginName} doesn't exist at ${pluginPath}`)
      else logger.error(`The plugin ${pluginName} doesn't exist at ${pluginPath}`)
      applyConfigTask?.stop()
      throw new Error(`The plugin ${pluginName} doesn't exist at ${pluginPath}`)
    }
    const pluginConfigPath = path.join(pluginPath, configFileName)
    const pluginConfig = (await fs.readJson(pluginConfigPath)) as TPluginConfig
    try {
      pluginConfigSchema.parse(pluginConfig)
    } catch (error) {
      if (applyConfigTask)
        applyConfigTask.error(`The plugin config file ${pluginConfigPath} is not valid. Contact developer`)
      else logger.error(`The plugin config file ${pluginConfigPath} is not valid. Contact developer`)
      applyConfigTask?.stop()
      logger.error(error)
      throw error
    }

    //? Check if the plugin config exists
    if (!(await fs.exists(pluginConfigPath))) {
      if (applyConfigTask)
        applyConfigTask.error(`The plugin config for ${pluginName} doesn't exist at ${pluginConfigPath}`)
      else logger.error(`The plugin config for ${pluginName} doesn't exist at ${pluginConfigPath}`)
      applyConfigTask?.stop()
      throw new Error(`The plugin config for ${pluginName} doesn't exist at ${pluginConfigPath}`)
    }

    const relativeDestinationPaths = pluginConfig.paths.map((p) => p.to)

    // Verify if the template doesnt already exist
    for (const relativeDestinationPath of relativeDestinationPaths) {
      const destinationPath = path.join(root, relativeDestinationPath)
      if (await fs.exists(destinationPath)) {
        if (applyConfigTask) applyConfigTask.error(`A file/folder already exists at the destination ${destinationPath}`)
        else logger.error(`A file/folder already exists at the destination ${destinationPath}`)
        applyConfigTask?.stop()
        throw new Error(`A file/folder already exists at the destination ${destinationPath}`)
      }
    }
  }

  //* Apply the plugins
  if (applyConfigTask) applyConfigTask.log("Applying the plugins")
  else logger.info("Applying the plugins")
  for (const plugin of config.plugins) {
    const pluginName = typeof plugin === "string" ? plugin : plugin.name
    const pluginPath = path.join(pluginsDirectory, pluginName)
    const pluginConfigPath = path.join(pluginPath, configFileName)
    const pluginConfig = (await fs.readJson(pluginConfigPath)) as TPluginConfig
    // Copy the plugin to the destination
    for (const { from, to: defaultTo } of pluginConfig.paths) {
      const to = typeof plugin === "string" ? defaultTo : (plugin.paths.find((p) => p.from === from)?.to ?? defaultTo)
      const sourcePath = path.join(pluginPath, from)
      const destinationPath = path.join(root, to)
      if (applyConfigTask) applyConfigTask.log(`Copying the plugin ${pluginName} to the destination ${destinationPath}`)
      else logger.info(`Copying the plugin ${pluginName} to the destination ${destinationPath}`)
      await fs.copy(sourcePath, destinationPath)
    }
  }

  //* Delete config.json
  //   applyConfigTask.log("Deleting the config file")
  //   await fs.remove(configPath)

  if (applyConfigTask) applyConfigTask.stop("The template config has been applied! 🎉")
  else logger.success("The template config has been applied! 🎉")
  logger.info("You can now delete the config file if you want")
}
