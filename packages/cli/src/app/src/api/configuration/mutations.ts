import { z } from "zod"

import { getConfiguration, setConfiguration } from "@/lib/configuration"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { updateConfigurationRequestSchema, updateConfigurationResponseSchema } from "./schemas"

export const updateConfiguration = async ({
  input: { configuration: _configuration },
}: apiInputFromSchema<typeof updateConfigurationRequestSchema>) => {
  try {
    const configuration = getConfiguration()

    // Merge the new configuration with the old one
    setConfiguration({ ...configuration, ..._configuration })

    const data: z.infer<ReturnType<typeof updateConfigurationResponseSchema>> = { configuration }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
