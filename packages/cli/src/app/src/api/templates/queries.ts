import { z } from "zod"

import { getTemplate, getTemplates } from "@/lib/templates"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getTemplateResponseSchema, getTemplateSchema, getTemplatesResponseSchema, getTemplatesSchema } from "./schemas"

export const getTemplatesQuery = async ({}: apiInputFromSchema<typeof getTemplatesSchema>) => {
  try {
    const templates = await getTemplates()

    const data: z.infer<ReturnType<typeof getTemplatesResponseSchema>> = { templates }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const getTemplateQuery = async ({ input: { id } }: apiInputFromSchema<typeof getTemplateSchema>) => {
  try {
    const template = await getTemplate(id)

    if (!template) {
      throw new Error("Template not found")
    }

    const data: z.infer<ReturnType<typeof getTemplateResponseSchema>> = { template }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
