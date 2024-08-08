import { z } from "zod"

import { pluginConfigSchema } from "@next-boilerplate/scripts/utils/template-config"

export const getPluginsSchema = () =>
  z.object({
    search: z.string().optional(),
  })

export const getPluginsResponseSchema = () =>
  z.object({
    plugins: z.array(
      pluginConfigSchema.extend({
        path: z.string(),
      })
    ),
  })
