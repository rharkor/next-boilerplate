import { env } from "env.mjs"
import { logger } from "../logger"

function getBaseUrl() {
  if (typeof window !== "undefined") return ""
  if (env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (env.BASE_URL) return env.BASE_URL
  logger.warn("No BASE_URL or VERCEL_URL found, using http://localhost:3000")
  return "http://localhost:3000"
}

export function getUrl() {
  return getBaseUrl() + "/api/trpc"
}
