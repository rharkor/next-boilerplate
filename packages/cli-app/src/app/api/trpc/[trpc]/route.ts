import { appRouter } from "@/api/_app"
import { createTRPCContext } from "@/lib/trpc/init"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })
export { handler as GET, handler as POST }
