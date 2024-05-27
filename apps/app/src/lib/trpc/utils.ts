import { AppRouter } from "@/api/_app"
import { inferRouterOutputs } from "@trpc/server"

import { env } from "../env"

export function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return ""
  // eslint-disable-next-line no-process-env
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    // eslint-disable-next-line no-process-env
    return `https://${process.env.VERCEL_URL}`
  return env.NEXT_PUBLIC_BASE_URL
}

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = RouterOutputs['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>
