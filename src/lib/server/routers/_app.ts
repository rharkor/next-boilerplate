import { meRouter } from "./me"
import { authRouter } from "./register"
import { router } from "../trpc"

export const appRouter = router({
  auth: authRouter,
  me: meRouter,
})

export type AppRouter = typeof appRouter
