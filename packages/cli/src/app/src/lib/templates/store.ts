import { z } from "zod"

import { configSchema } from "@next-boilerplate/scripts/utils/template-config"

export const fullTemplateSchema = configSchema.extend({
  sourcePath: z.string(),
})
export type TTemplateStore = z.infer<typeof fullTemplateSchema>
let templates: TTemplateStore[] | null = null

export const getTemplatesFromStore = async () => {
  return templates
}

export const setTemplatesToStore = async (newTemplates: TTemplateStore[]) => {
  templates = newTemplates
}

export const resetTemplatesStore = async () => {
  templates = null
}
