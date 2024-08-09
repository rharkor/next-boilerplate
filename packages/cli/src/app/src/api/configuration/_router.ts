import { publicProcedure, router } from "@/lib/server/trpc"

import { resetConfiguration, updateConfiguration } from "./mutations"
import { getConfigurationQuery } from "./queries"
import {
  getConfigurationResponseSchema,
  resetConfigurationResponseSchema,
  updateConfigurationRequestSchema,
  updateConfigurationResponseSchema,
} from "./schemas"

export const configurationRouter = router({
  getConfiguration: publicProcedure.output(getConfigurationResponseSchema()).query(getConfigurationQuery),
  updateConfiguration: publicProcedure
    .input(updateConfigurationRequestSchema())
    .output(updateConfigurationResponseSchema())
    .mutation(updateConfiguration),
  resetConfiguration: publicProcedure.output(resetConfigurationResponseSchema()).mutation(resetConfiguration),
})
