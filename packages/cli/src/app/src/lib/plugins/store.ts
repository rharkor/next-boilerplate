import { z } from "zod"

import { pluginConfigSchema } from "@next-boilerplate/scripts/utils/template-config"

export const fullPluginSchema = pluginConfigSchema.extend({
  sourcePath: z.string(),
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
