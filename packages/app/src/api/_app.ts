import { authRouter } from "./auth/_router"
import { meRouter } from "./me/_router"
import { uploadRouter } from "./upload/_router"
import { router } from "../lib/server/trpc"

export const appRouter = router({
  auth: authRouter,
  me: meRouter,
  upload: uploadRouter,
})

export type AppRouter = typeof appRouter
