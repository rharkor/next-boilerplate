import fs from "fs-extra"
import { globby } from "globby"
import path from "path"
import { fileURLToPath } from "url"

import { pluginConfigSchema, TPluginConfig } from "@next-boilerplate/scripts/utils/template-config/index.js"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import { getPluginsFromStore, setPluginsToStore, TPluginStore } from "./store"

// Get the current package directory
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory
const dir = path.resolve(__dirname, "../../../../..")

const configFileName = "config.json"
const pluginsDirectory = path.join(dir, "assets", "plugins")

export const getPlugins = async () => {
  const pluginsFromStore = await getPluginsFromStore()
  if (pluginsFromStore) return pluginsFromStore

  logger.info("Loading plugins")
  if (!(await fs.exists(pluginsDirectory))) {
    throw new TRPCError({
      message: `The plugins directory doesn't exist at ${pluginsDirectory}`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  //* Get all the plugins
  const plugins = await globby(path.join(pluginsDirectory, "**", configFileName))
  const pluginsFilled: TPluginStore[] = []

  //* Validate their config
  for (const plugin of plugins) {
    const pluginConfig = (await fs.readJson(plugin)) as TPluginConfig

    try {
      pluginConfigSchema.parse(pluginConfig)
    } catch (error) {
      logger.error(error)
      throw new TRPCError({
        message: `The config of the plugin ${plugin} is invalid`,
        code: "INTERNAL_SERVER_ERROR",
      })
    }

    pluginsFilled.push({ ...pluginConfig, path: path.dirname(plugin) })
  }

  setPluginsToStore(pluginsFilled)
  return pluginsFilled
}
