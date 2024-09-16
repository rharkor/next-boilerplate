import { publicProcedure, router } from "@/lib/trpc/init"

import { applyConfiguration, resetConfiguration, updateConfiguration } from "./mutations"
import { getConfigurationQuery } from "./queries"
import {
  applyConfigurationResponseSchema,
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
  applyConfiguration: publicProcedure.output(applyConfigurationResponseSchema()).mutation(applyConfiguration),
})
