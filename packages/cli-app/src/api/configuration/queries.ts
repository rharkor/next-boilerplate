import { z } from "zod"

import { getConfiguration } from "@/lib/configuration"
import { getPlugins } from "@/lib/plugins"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { getStoreUID } from "@next-boilerplate/cli-helpers/stores"
import { TRPCError } from "@trpc/server"

import { getConfigurationResponseSchema } from "./schemas"

export const getConfigurationQuery = async ({}: apiInputFromSchema<typeof undefined>) => {
  try {
    const _configuration = await getConfiguration()
    const plugins = await getPlugins()

    const configuration = {
      ..._configuration,
      plugins: _configuration.plugins?.map((plugin) => {
        const foundPlugin = plugins.find(
          (p) => p.sourcePath === plugin.sourcePath && getStoreUID(p.store) === getStoreUID(plugin.store)
        )
        if (!foundPlugin) {
          throw new TRPCError({
            message: `The plugin ${plugin.sourcePath} was not found (store: ${plugin.store.name}@${plugin.store.version}). Currently available plugins: ${plugins.map((p) => p.sourcePath).join(", ")}`,
            code: "INTERNAL_SERVER_ERROR",
          })
        }

        return {
          ...plugin,
          remotePlugin: foundPlugin,
        }
      }),
    }

    const data: z.infer<ReturnType<typeof getConfigurationResponseSchema>> = { configuration }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
