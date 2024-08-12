import fs from "fs-extra"
import { globby } from "globby"
import path from "path"

import { pluginConfigSchema, TPluginConfig } from "@next-boilerplate/scripts/utils/template-config/index.js"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import {
  getPluginsFromStore,
  getSinglePluginFromStore,
  setPluginsToStore,
  setSinglePluginToStore,
  TPluginStore,
} from "./store"

// Get the current package directory
const cwd = process.cwd()
// eslint-disable-next-line no-process-env
const dir = path.resolve(cwd, "../..")

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

    const sourcePath = path.dirname(plugin).replace(pluginsDirectory, "").replace(/^\//, "")
    pluginsFilled.push({ ...pluginConfig, sourcePath, id: sourcePath })
  }

  pluginsFilled.sort((a, b) => a.name.localeCompare(b.name))

  setPluginsToStore(pluginsFilled)
  return pluginsFilled
}

export const getPlugin = async (id: string) => {
  const pluginFromStore = await getSinglePluginFromStore(id)
  if (pluginFromStore) return pluginFromStore

  const plugins = await getPlugins()
  const plugin = plugins.find((p) => p.id === id)
  if (!plugin) {
    throw new TRPCError({
      message: `Plugin ${id} not found`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  setSinglePluginToStore(id, plugin)
  return plugin
}
