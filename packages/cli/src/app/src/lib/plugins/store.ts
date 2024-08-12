import { z } from "zod"

import { pluginConfigSchema } from "@next-boilerplate/scripts/utils/template-config"

export const fullPluginSchema = pluginConfigSchema.extend({
  sourcePath: z.string(),
  id: z.string(),
})
export type TPluginStore = z.infer<typeof fullPluginSchema>

let plugins: TPluginStore[] | null = null

export const getPluginsFromStore = async () => {
  return plugins
}

export const setPluginsToStore = async (newPlugins: TPluginStore[]) => {
  plugins = newPlugins
}

export const resetPluginsStore = async () => {
  plugins = null
}

export const singlePluginSchema = fullPluginSchema
export type TPlugin = z.infer<typeof singlePluginSchema>

let singlePlugins: Record<string, TPlugin> = {}

export const getSinglePluginFromStore = async (id: string) => {
  return singlePlugins[id]
}

export const setSinglePluginToStore = async (id: string, plugin: TPlugin) => {
  singlePlugins[id] = plugin
}

export const resetSinglePluginStore = async () => {
  singlePlugins = {}
}
