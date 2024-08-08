import { z } from "zod"

import { getPlugins } from "@/lib/plugins"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getPluginsResponseSchema, getPluginsSchema } from "./schemas"

export const getPluginsQuery = async ({}: apiInputFromSchema<typeof getPluginsSchema>) => {
  try {
    const plugins = await getPlugins()

    const data: z.infer<ReturnType<typeof getPluginsResponseSchema>> = { plugins }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
