import fs from "fs-extra"
import { globby } from "globby"
import path from "path"
import { z } from "zod"

import {
  pluginConfigSchema,
  storeConfigSchema,
  TPluginConfig,
} from "@next-boilerplate/scripts/utils/template-config/index.js"
import { getStores } from "@next-boilerplate/scripts/utils/template-config/stores.js"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import { env } from "../env"

import { TPluginStore } from "./types"

// Get the current package directory
const cwd = process.cwd()
// eslint-disable-next-line no-process-env
const dir = path.resolve(cwd, env.CLI_REL_PATH ?? "../..")

const configFileName = "config.json"
export const rootAssetsDirectory = path.join(dir, "assets")

const loadPlugins = async () => {
  const pluginsFilled: TPluginStore[] = []
  const stores = await getStores({ assetsDirectory: rootAssetsDirectory })
  for (const store of stores) {
    const pluginsDirectory = path.join(store.fullPath, "data", "plugins")
    await fs.ensureDir(pluginsDirectory)

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
      pluginsFilled.push({ ...pluginConfig, sourcePath, store })
    }
  }

  pluginsFilled.sort((a, b) => a.name.localeCompare(b.name))

  return pluginsFilled
}

export const getPlugins = async (opts?: { search?: string }) => {
  const plugins = await new Promise<TPluginStore[]>(async (resolve) => {
    const plugins = await loadPlugins()
    resolve(plugins)
    return
  })
  return plugins.filter((plugin) => {
    if (!opts?.search) return true
    return plugin.name.toLowerCase().includes(opts.search.toLowerCase())
  })
}

export const getPlugin = async (name: string, store: z.infer<typeof storeConfigSchema>) => {
  const plugins = await getPlugins()
  const plugin = plugins.find(
    (p) => p.name === name && p.store.name === store.name && p.store.version === store.version
  )
  if (!plugin) {
    throw new TRPCError({
      message: `Plugin ${name} not found (store: ${store.name}@${store.version})`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  return plugin
}
