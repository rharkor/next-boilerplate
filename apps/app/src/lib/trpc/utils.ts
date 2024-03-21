import { AppRouter } from "@/api/_app"
import { env } from "@/lib/env"
import { logger } from "@next-boilerplate/lib/logger"
import { inferRouterOutputs } from "@trpc/server"

function getBaseUrl() {
  if (typeof window !== "undefined") return ""
  if (env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (env.NEXT_PUBLIC_BASE_URL) return env.NEXT_PUBLIC_BASE_URL
  logger.warn("No NEXT_PUBLIC_BASE_URL or VERCEL_URL found, using http://localhost:3000")
  return "http://localhost:3000"
}

export function getUrl() {
  return getBaseUrl() + "/api/trpc"
}

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = RouterOutputs['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>
