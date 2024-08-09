import { z } from "zod"

import { getTemplates } from "@/lib/templates"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getTemplatesResponseSchema, getTemplatesSchema } from "./schemas"

export const getTemplatesQuery = async ({}: apiInputFromSchema<typeof getTemplatesSchema>) => {
  try {
    const templates = await getTemplates()

    const data: z.infer<ReturnType<typeof getTemplatesResponseSchema>> = { templates }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
