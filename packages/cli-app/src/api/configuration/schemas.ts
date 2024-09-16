import { z } from "zod"

import { fullPluginSchema } from "@/lib/plugins/types"
import { storeNameRegex, storeVersionRegex } from "@next-boilerplate/scripts/utils/template-config/index.js"

export const configurationSchema = () =>
  z.object({
    name: z.string().optional(),
    plugins: z.array(fullPluginSchema).optional(),
    stores: z
      .array(
        z.object({
          name: z.string().regex(storeNameRegex),
          version: z.string().regex(storeVersionRegex),
        })
      )
      .optional(),
  })
export type TConfiguration = z.infer<ReturnType<typeof configurationSchema>>

export const getConfigurationResponseSchema = () => z.object({ configuration: configurationSchema() })

export const updateConfigurationRequestSchema = () => z.object({ configuration: configurationSchema() })
export const updateConfigurationResponseSchema = () => z.object({ configuration: configurationSchema() })

export const resetConfigurationResponseSchema = () => z.object({ configuration: configurationSchema() })

export const applyConfigurationResponseSchema = () =>
  z.object({
    configuration: configurationSchema(),
  })
