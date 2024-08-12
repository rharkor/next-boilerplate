import { z } from "zod"

import { templateSchema } from "@next-boilerplate/scripts/utils/template-config"

import { fullPluginSchema } from "../plugins/store"

export const fullTemplateSchema = templateSchema.extend({
  sourcePath: z.string(),
  id: z.string(),
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

export const singleTemplateSchema = fullTemplateSchema.extend({
  plugins: z.array(fullPluginSchema),
})
export type TTemplate = z.infer<typeof singleTemplateSchema>

let singleTemplates: Record<string, TTemplate> = {}

export const getSingleTemplateFromStore = async (id: string) => {
  return singleTemplates[id]
}

export const setSingleTemplateToStore = async (id: string, template: TTemplate) => {
  singleTemplates[id] = template
}

export const resetSingleTemplateStore = async () => {
  singleTemplates = {}
}
