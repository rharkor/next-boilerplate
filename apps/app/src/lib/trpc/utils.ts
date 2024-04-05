import { AppRouter } from "@/api/_app"
import { inferRouterOutputs } from "@trpc/server"

export function getUrl() {
  return "/api/trpc"
}

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = RouterOutputs['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>
