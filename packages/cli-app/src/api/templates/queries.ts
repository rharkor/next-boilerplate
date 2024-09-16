import { z } from "zod"

import { getTemplate, getTemplates } from "@/lib/templates"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getTemplateResponseSchema, getTemplateSchema, getTemplatesResponseSchema, getTemplatesSchema } from "./schemas"

export const getTemplatesQuery = async ({ input }: apiInputFromSchema<typeof getTemplatesSchema>) => {
  try {
    const templates = await getTemplates(input)

    const data: z.infer<ReturnType<typeof getTemplatesResponseSchema>> = { templates }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const getTemplateQuery = async ({ input: { name, store } }: apiInputFromSchema<typeof getTemplateSchema>) => {
  try {
    const template = await getTemplate(name, store)

    if (!template) {
      throw new Error("Template not found")
    }

    const data: z.infer<ReturnType<typeof getTemplateResponseSchema>> = { template }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
