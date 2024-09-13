import { z } from "zod"

import { getConfiguration, setConfiguration } from "@/lib/configuration"
import { env } from "@/lib/env"
import { rootPluginsDirectory } from "@/lib/plugins"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { applyConfigurationTask } from "@next-boilerplate/scripts/utils/template-config/apply.js"

import { updateConfigurationRequestSchema, updateConfigurationResponseSchema } from "./schemas"

export const updateConfiguration = async ({
  input: { configuration: _configuration },
}: apiInputFromSchema<typeof updateConfigurationRequestSchema>) => {
  try {
    const configuration = await getConfiguration()

    // Merge the new configuration with the old one
    setConfiguration({ ...configuration, ..._configuration })

    const data: z.infer<ReturnType<typeof updateConfigurationResponseSchema>> = { configuration }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const resetConfiguration = async ({}: apiInputFromSchema<typeof undefined>) => {
  try {
    const configuration = await getConfiguration()
    setConfiguration({
      name: configuration.name,
    })

    const data: z.infer<ReturnType<typeof updateConfigurationResponseSchema>> = { configuration: {} }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const applyConfiguration = async ({}: apiInputFromSchema<typeof undefined>) => {
  try {
    const configuration = await getConfiguration()

    //* Apply the configuration
    await applyConfigurationTask({
      configFileName: "config.json",
      pluginsDirectory: rootPluginsDirectory,
      root: env.ROOT_PATH,
      noTask: true,
    })

    const data: z.infer<ReturnType<typeof updateConfigurationResponseSchema>> = { configuration }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
