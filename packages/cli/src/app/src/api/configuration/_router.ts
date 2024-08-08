import { publicProcedure, router } from "@/lib/server/trpc"

import { updateConfiguration } from "./mutations"
import { getConfigurationQuery } from "./queries"
import {
  getConfigurationResponseSchema,
  updateConfigurationRequestSchema,
  updateConfigurationResponseSchema,
} from "./schemas"

export const configurationRouter = router({
  getConfiguration: publicProcedure.output(getConfigurationResponseSchema()).query(getConfigurationQuery),
  updateConfiguration: publicProcedure
    .input(updateConfigurationRequestSchema())
    .output(updateConfigurationResponseSchema())
    .mutation(updateConfiguration),
})
