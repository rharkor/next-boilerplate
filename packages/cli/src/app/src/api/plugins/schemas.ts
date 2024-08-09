import { z } from "zod"

import { fullPluginSchema } from "@/lib/plugins/store"

export const getPluginsSchema = () =>
  z.object({
    search: z.string().optional(),
  })

export const getPluginsResponseSchema = () =>
  z.object({
    plugins: z.array(fullPluginSchema),
  })
