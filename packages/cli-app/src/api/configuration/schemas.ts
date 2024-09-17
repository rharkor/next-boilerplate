import { z } from "zod"

import { fullPluginSchema } from "@/lib/plugins/types"
import { storeSchema } from "@next-boilerplate/cli-helpers/stores"

export const configurationSchema = () =>
  z.object({
    name: z.string().optional(),
    plugins: z.array(fullPluginSchema).optional(),
    stores: z.array(storeSchema).optional(),
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
