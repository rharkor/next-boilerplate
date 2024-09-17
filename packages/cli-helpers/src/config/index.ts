import { z } from "zod"

import { pluginSchema } from "../plugins"
import { storeSchema } from "../stores"

/**
 * Schema for validating the configuration of the application.
 * It includes the name of the application, an array of plugins, and an array of stores.
 */
export const configSchema = z.object({
  name: z.string().max(100),
  // List of plugins to be installed
  plugins: z.array(
    // Extend the plugin schema to include the store information
    pluginSchema.extend({
      store: storeSchema,
    })
  ),
  // List of stores to be installed
  stores: z.array(storeSchema),
})

export type TConfig = z.infer<typeof configSchema>

export const optionalConfigSchema = configSchema.partial()

export type TOptionalConfig = z.infer<typeof optionalConfigSchema>
