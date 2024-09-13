import fs from "fs-extra"
import { globby } from "globby"
import path from "path"

import { pluginConfigSchema, TPluginConfig } from "@next-boilerplate/scripts/utils/template-config/index.js"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import { env } from "../env"
import { getStores } from "../stores"

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
const dir = path.resolve(cwd, env.CLI_REL_PATH ?? "../..")

const configFileName = "config.json"
export const rootPluginsDirectory = path.join(dir, "assets", "plugins")

const loadPlugins = async () => {
  const pluginsFilled: TPluginStore[] = []
  const stores = await getStores()
  for (const store of stores) {
    const pluginsDirectory = path.join(store.fullPath, "data", "plugins")
    if (!(await fs.exists(pluginsDirectory))) {
      throw new TRPCError({
        message: `The plugins directory doesn't exist at ${pluginsDirectory}`,
        code: "INTERNAL_SERVER_ERROR",
      })
    }

    //* Get all the plugins
    const formattedPluginsDirectory = pluginsDirectory.replace(/\\/g, "/")
    const globbyPath = path.join(formattedPluginsDirectory, "**", configFileName).replace(/\\/g, "/")
    const plugins = await globby(globbyPath)
    logger.debug(`Found ${plugins.length} plugins in ${globbyPath}`)

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

      const sourcePath = path.dirname(plugin).replace(formattedPluginsDirectory, "").replace(/^\//, "")
      pluginsFilled.push({ ...pluginConfig, sourcePath, id: sourcePath })
    }
  }

  pluginsFilled.sort((a, b) => a.name.localeCompare(b.name))

  setPluginsToStore(pluginsFilled)
  return pluginsFilled
}

export const getPlugins = async (opts?: { search?: string }) => {
  const plugins = await new Promise<TPluginStore[]>(async (resolve) => {
    const pluginsFromStore = await getPluginsFromStore()
    if (pluginsFromStore) {
      resolve(pluginsFromStore)
      return
    }

    const plugins = await loadPlugins()
    resolve(plugins)
    return
  })
  return plugins.filter((plugin) => {
    if (!opts?.search) return true
    return plugin.name.toLowerCase().includes(opts.search.toLowerCase())
  })
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
