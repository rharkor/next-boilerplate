import { z } from "zod"

import { getPlugin, getPlugins } from "@/lib/plugins"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getPluginResponseSchema, getPluginSchema, getPluginsResponseSchema, getPluginsSchema } from "./schemas"

export const getPluginsQuery = async ({}: apiInputFromSchema<typeof getPluginsSchema>) => {
  try {
    const plugins = await getPlugins()

    const data: z.infer<ReturnType<typeof getPluginsResponseSchema>> = { plugins }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const getPluginQuery = async ({ input: { id } }: apiInputFromSchema<typeof getPluginSchema>) => {
  try {
    const plugin = await getPlugin(id)

    if (!plugin) {
      throw new Error("Plugin not found")
    }

    const data: z.infer<ReturnType<typeof getPluginResponseSchema>> = { plugin }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
