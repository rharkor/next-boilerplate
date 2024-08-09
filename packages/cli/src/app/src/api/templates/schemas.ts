import { z } from "zod"

import { fullTemplateSchema } from "@/lib/templates/store"

export const getTemplatesSchema = () =>
  z.object({
    search: z.string().optional(),
  })

export const getTemplatesResponseSchema = () =>
  z.object({
    templates: z.array(fullTemplateSchema),
  })
