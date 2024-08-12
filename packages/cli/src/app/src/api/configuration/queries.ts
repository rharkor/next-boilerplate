import { z } from "zod"

import { getConfiguration } from "@/lib/configuration"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getConfigurationResponseSchema } from "./schemas"

export const getConfigurationQuery = async ({}: apiInputFromSchema<typeof undefined>) => {
  try {
    const configuration = await getConfiguration()

    const data: z.infer<ReturnType<typeof getConfigurationResponseSchema>> = { configuration }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
