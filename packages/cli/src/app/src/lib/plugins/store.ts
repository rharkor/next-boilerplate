import { TPluginConfig } from "@next-boilerplate/scripts/utils/template-config"

export type TPluginStore = TPluginConfig & { path: string }

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
