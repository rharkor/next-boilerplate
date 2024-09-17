import { z } from "zod"

import { fullPluginSchema, singlePluginSchema } from "@/lib/plugins/types"
import { storeConfigSchema } from "@next-boilerplate/cli-helpers/stores"

export const getPluginsSchema = () =>
  z.object({
    search: z.string().optional(),
  })

export const getPluginsResponseSchema = () =>
  z.object({
    plugins: z.array(fullPluginSchema),
  })

export const getPluginSchema = () =>
  z.object({
    name: z.string(),
    store: storeConfigSchema,
  })

export const getPluginResponseSchema = () =>
  z.object({
    plugin: singlePluginSchema,
  })
