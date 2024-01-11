import { env } from "env.mjs"

import { logger } from "@lib/logger"

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
