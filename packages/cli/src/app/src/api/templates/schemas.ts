import { z } from "zod"

import { fullTemplateSchema, singleTemplateSchema } from "@/lib/templates/store"

export const getTemplatesSchema = () =>
  z.object({
    search: z.string().optional(),
  })

export const getTemplatesResponseSchema = () =>
  z.object({
    templates: z.array(fullTemplateSchema),
  })

export const getTemplateSchema = () =>
  z.object({
    id: z.string(),
  })

export const getTemplateResponseSchema = () =>
  z.object({
    template: singleTemplateSchema,
  })
