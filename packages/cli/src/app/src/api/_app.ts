import { router } from "../lib/server/trpc"

import { configurationRouter } from "./configuration/_router"
import { pluginsRouter } from "./plugins/_router"

export const appRouter = router({
  plugins: pluginsRouter,
  configuration: configurationRouter,
})

export type AppRouter = typeof appRouter
