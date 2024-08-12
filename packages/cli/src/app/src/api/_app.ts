import { router } from "../lib/server/trpc"

import { configurationRouter } from "./configuration/_router"
import { pluginsRouter } from "./plugins/_router"
import { templatesRouter } from "./templates/_router"

export const appRouter = router({
  configuration: configurationRouter,
  plugins: pluginsRouter,
  templates: templatesRouter,
})

export type AppRouter = typeof appRouter
