import { publicProcedure, router } from "@/lib/server/trpc"

import { getTemplateQuery, getTemplatesQuery } from "./queries"
import { getTemplateResponseSchema, getTemplateSchema, getTemplatesResponseSchema, getTemplatesSchema } from "./schemas"

export const templatesRouter = router({
  getTemplates: publicProcedure
    .input(getTemplatesSchema())
    .output(getTemplatesResponseSchema())
    .query(getTemplatesQuery),
  getTemplate: publicProcedure.input(getTemplateSchema()).output(getTemplateResponseSchema()).query(getTemplateQuery),
})
