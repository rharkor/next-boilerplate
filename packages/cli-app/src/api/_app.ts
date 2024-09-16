import { router } from "@/lib/trpc/init"

import { configurationRouter } from "./configuration/_router"
import { pluginsRouter } from "./plugins/_router"
import { storesRouter } from "./stores/_router"
import { templatesRouter } from "./templates/_router"

export const appRouter = router({
  configuration: configurationRouter,
  plugins: pluginsRouter,
  templates: templatesRouter,
  stores: storesRouter,
})

export type AppRouter = typeof appRouter
