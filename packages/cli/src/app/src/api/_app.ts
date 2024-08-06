import { router } from "../lib/server/trpc"

export const appRouter = router({})

export type AppRouter = typeof appRouter
