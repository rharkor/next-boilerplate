import { z } from "zod"

import { pluginConfigSchema } from "@next-boilerplate/scripts/utils/template-config/index.js"

export const fullPluginSchema = pluginConfigSchema.extend({
  sourcePath: z.string(),
  id: z.string(),
})
export const singlePluginSchema = fullPluginSchema
export type TPlugin = z.infer<typeof singlePluginSchema>
export type TPluginStore = z.infer<typeof fullPluginSchema>
