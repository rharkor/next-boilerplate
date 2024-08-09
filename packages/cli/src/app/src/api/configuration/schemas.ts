import { z } from "zod"

import { fullPluginSchema, pluginConfigSchema } from "@next-boilerplate/scripts/utils/template-config"

export const configurationSchema = () =>
  z.object({
    name: z.string().optional(),
    plugins: z.array(fullPluginSchema.extend({ config: pluginConfigSchema })).optional(),
  })
export type TConfiguration = z.infer<ReturnType<typeof configurationSchema>>

export const getConfigurationResponseSchema = () => z.object({ configuration: configurationSchema() })

export const updateConfigurationRequestSchema = () => z.object({ configuration: configurationSchema() })
export const updateConfigurationResponseSchema = () => z.object({ configuration: configurationSchema() })

export const resetConfigurationResponseSchema = () => z.object({ configuration: configurationSchema() })
