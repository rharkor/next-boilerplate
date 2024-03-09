import { type AppRouter } from "@/api/_app"
import { createTRPCReact } from "@trpc/react-query"

export const trpc = createTRPCReact<AppRouter>({})
