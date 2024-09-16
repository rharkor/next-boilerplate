import { z } from "zod"

import { fullPluginSchema, singlePluginSchema } from "@/lib/plugins/types"

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
    id: z.string(),
  })

export const getPluginResponseSchema = () =>
  z.object({
    plugin: singlePluginSchema,
  })
