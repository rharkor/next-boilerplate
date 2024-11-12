import fs from "fs-extra"
import path from "path"

import { logger } from "@rharkor/logger"
import { task } from "@rharkor/task"

import { getStoreDataDirectory } from "./stores/helpers"
import { configSchema, TConfig } from "./config"
import { pluginConfigFileName, pluginConfigSchema, pluginsFolder, TPluginConfig } from "./plugins"
import { globby } from "globby"

const getPluginPath = ({ assetsDirectory, plugin }: { plugin: TConfig["plugins"][number]; assetsDirectory: string }) =>
  path.join(
    getStoreDataDirectory({
      store: plugin.store,
      assetsDirectory,
    }),
    pluginsFolder,
    plugin.name // The name in the config file is the relative path from the store
  )

/**
 * Apply the configuration of a template to the root directory.
 * @param param0
 */
export const applyConfigurationTask = async ({
  assetsDirectory,
  root,
  noTask,
}: {
  assetsDirectory: string
  root: string
  noTask: boolean
}) => {
  let _applyConfigTask: null | Awaited<ReturnType<(typeof task)["startTask"]>> = null
  if (!noTask) {
    _applyConfigTask = await task.startTask({
      name: "Apply template config... 🧰",
    })
  }
  const applyConfigTask = _applyConfigTask ?? {
    log: (message: string) => logger.info(message),
    error: (message: string) => logger.error(message),
    stop: (message?: string) => logger.success(message),
  }

  //* Retrieve config
  applyConfigTask.log("Retrieving the config")
  // Remove the last part of the path to get the root
  // Example: /path/to/root/config.json -> /path/to/root
  // Example: /path/to/root -> /path/to/root
  const configPath = !root.endsWith(pluginConfigFileName) ? path.join(root, pluginConfigFileName) : root

  // Check if the config file exists
  if (!(await fs.exists(configPath))) {
    applyConfigTask.error(`The config file ${configPath} doesn't exist`)
    applyConfigTask.stop()
    throw new Error(`The config file ${configPath} doesn't exist`)
  }

  // Validate the config file
  const { data: config, error } = configSchema.safeParse(await fs.readJson(configPath))
  if (error) {
    applyConfigTask.error(`The config file ${configPath} is not valid`)
    applyConfigTask.stop()
    logger.error(error)
    throw error
  }

  //* Verify plugins
  // Verify plugins installation and config validity
  applyConfigTask.log("Applying plugins")
  for (const plugin of config.plugins) {
    // Find the installed plugin path
    const pluginPath = getPluginPath({ assetsDirectory, plugin })

    // Check if the plugin exists
    if (!(await fs.exists(pluginPath))) {
      applyConfigTask.error(`The plugin ${plugin.name} doesn't exist at ${pluginPath}`)
      applyConfigTask.stop()
      throw new Error(`The plugin ${plugin.name} doesn't exist at ${pluginPath}`)
    }

    const pluginConfigPath = path.join(pluginPath, pluginConfigFileName)

    // Check if the plugin config exists
    if (!(await fs.exists(pluginConfigPath))) {
      applyConfigTask.error(`The plugin config for ${plugin.name} doesn't exist at ${pluginConfigPath}`)
      applyConfigTask.stop()
      throw new Error(`The plugin config for ${plugin.name} doesn't exist at ${pluginConfigPath}`)
    }

    // Check if the plugin config is valid
    const { data: pluginConfig, error } = pluginConfigSchema.safeParse(await fs.readJson(pluginConfigPath))
    if (error) {
      applyConfigTask.error(`The plugin config file ${pluginConfigPath} is not valid. Contact developer`)
      applyConfigTask.stop()
      logger.error(error)
      throw error
    }

    // Verify if the destination paths are valid and if they don't already exist
    const relativeDestinationPaths = pluginConfig.paths.map((p) => p.to)
    for (const relativeDestinationPath of relativeDestinationPaths) {
      const destinationPath = path.join(root, relativeDestinationPath)
      if (await fs.exists(destinationPath)) {
        applyConfigTask.error(`A file/folder already exists at the destination ${destinationPath}`)
        applyConfigTask.stop()
        throw new Error(`A file/folder already exists at the destination ${destinationPath}`)
      }
    }
  }

  //* Apply the plugins
  applyConfigTask.log("Applying the plugins")
  for (const plugin of config.plugins) {
    const pluginPath = getPluginPath({ assetsDirectory, plugin })
    const pluginConfigPath = path.join(pluginPath, pluginConfigFileName)
    const pluginConfig = (await fs.readJson(pluginConfigPath)) as TPluginConfig

    // Copy the plugin to the destination
    for (const { from, to } of pluginConfig.paths) {
      const sourcePath = path.join(pluginPath, from)
      const destinationPath = path.join(root, to)
      applyConfigTask.log(`Copying the plugin ${plugin.name} to the destination ${destinationPath}`)
      await fs.copy(sourcePath, destinationPath)
    }
  }

  //*** Apply scripts ***
  for (const plugin of config.plugins) {
    const pluginPath = getPluginPath({ assetsDirectory, plugin })
    const pluginConfigPath = path.join(pluginPath, pluginConfigFileName)
    const pluginConfig = (await fs.readJson(pluginConfigPath)) as TPluginConfig
    const { scripts } = pluginConfig
    //* Replace by project name
    if (scripts?.replaceByProjectName) {
      const { search } = scripts.replaceByProjectName

      // Handle either root-based or paths-based replacement
      if ("root" in scripts.replaceByProjectName) {
        const { root: searchRoot } = scripts.replaceByProjectName
        const fullSearchPath = path.join(root, searchRoot)

        // Find all files under root path using globby
        const files = await globby("**/*", {
          cwd: fullSearchPath,
          absolute: true,
        })

        // Replace in each file
        for (const filePath of files) {
          applyConfigTask.log(`Replacing "${search}" with project name in ${filePath}`)
          const content = await fs.readFile(filePath, "utf-8")
          const updatedContent = content.replaceAll(search, config.name)
          await fs.writeFile(filePath, updatedContent)
        }
      } else {
        const { paths: searchPaths } = scripts.replaceByProjectName
        // Replace in specific paths using globby
        for (const searchPath of searchPaths) {
          const fullPath = path.join(root, searchPath)

          const files = await globby(fullPath, {
            absolute: true,
          })

          for (const filePath of files) {
            applyConfigTask.log(`Replacing "${search}" with project name in ${filePath}`)
            const content = await fs.readFile(filePath, "utf-8")
            const updatedContent = content.replaceAll(search, config.name)
            await fs.writeFile(filePath, updatedContent)
          }
        }
      }
    }
  }

  //* Delete config.json
  //   applyConfigTask.log("Deleting the config file")
  //   await fs.remove(configPath)

  applyConfigTask.stop("The template config has been applied! 🎉")
  logger.info("You can now delete the config file if you want")
}
