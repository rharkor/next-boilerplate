import { z } from "zod"

import { pluginSchema } from "../plugins"
import { storeSchema } from "../stores"

/**
 * Schema for validating the configuration of a template.
 * A template is a collection of plugins that can be installed in an application.
 */
export const templateSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(300),
  plugins: z.array(
    pluginSchema
      .extend({
        store: storeSchema,
      })
      .or(z.string())
  ),
})
