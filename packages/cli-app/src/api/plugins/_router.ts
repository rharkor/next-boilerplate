import { publicProcedure, router } from "@/lib/trpc/init"

import { getPluginQuery, getPluginsQuery } from "./queries"
import { getPluginResponseSchema, getPluginSchema, getPluginsResponseSchema, getPluginsSchema } from "./schemas"

export const pluginsRouter = router({
  getPlugins: publicProcedure.input(getPluginsSchema()).output(getPluginsResponseSchema()).query(getPluginsQuery),
  getPlugin: publicProcedure.input(getPluginSchema()).output(getPluginResponseSchema()).query(getPluginQuery),
})
