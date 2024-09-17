import { z } from "zod"

import { pluginConfigSchema } from "@next-boilerplate/cli-helpers/plugins"
import { storeConfigSchema } from "@next-boilerplate/cli-helpers/stores"

export const fullPluginSchema = pluginConfigSchema.extend({
  sourcePath: z.string(),
  store: storeConfigSchema,
})
export const singlePluginSchema = fullPluginSchema
export type TPlugin = z.infer<typeof singlePluginSchema>
export type TPluginStore = z.infer<typeof fullPluginSchema>
