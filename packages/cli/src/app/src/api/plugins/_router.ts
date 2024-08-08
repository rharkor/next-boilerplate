import { publicProcedure, router } from "@/lib/server/trpc"

import { getPluginsQuery } from "./queries"
import { getPluginsResponseSchema, getPluginsSchema } from "./schemas"

export const pluginsRouter = router({
  getPlugins: publicProcedure.input(getPluginsSchema()).output(getPluginsResponseSchema()).query(getPluginsQuery),
})
