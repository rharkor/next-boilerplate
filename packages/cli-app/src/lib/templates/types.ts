import { z } from "zod"

import { templateSchema } from "@next-boilerplate/scripts/utils/template-config/index.js"

import { fullPluginSchema } from "../plugins/types"

export const fullTemplateSchema = templateSchema.extend({
  sourcePath: z.string(),
  id: z.string(),
})
export type TTemplateStore = z.infer<typeof fullTemplateSchema>

export const singleTemplateSchema = fullTemplateSchema.extend({
  plugins: z.array(fullPluginSchema),
})
export type TTemplate = z.infer<typeof singleTemplateSchema>
