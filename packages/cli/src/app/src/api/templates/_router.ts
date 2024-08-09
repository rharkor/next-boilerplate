import { publicProcedure, router } from "@/lib/server/trpc"

import { getTemplatesQuery } from "./queries"
import { getTemplatesResponseSchema, getTemplatesSchema } from "./schemas"

export const templatesRouter = router({
  getTemplates: publicProcedure
    .input(getTemplatesSchema())
    .output(getTemplatesResponseSchema())
    .query(getTemplatesQuery),
})
