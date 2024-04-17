import { NextResponse } from "next/server"
import requestIp from "request-ip"

import { RATE_LIMIT_DURATION, RATE_LIMIT_PER_INTERVAL } from "@/constants/rate-limit"
import { env } from "@/lib/env"
import { logger } from "@next-boilerplate/lib"

import { ApiError } from "./utils/server-utils"
import { redis as client } from "./redis"

type Result = {
  limit: number
  remaining: number
  success: boolean
}

const rateLimiter = async (identifier: string, limit: number, duration: number): Promise<Result> => {
  const key = `rate_limit:${identifier}`
  const currentCount = await client.get(key)
  const currentCountTTLLeft = await client.ttl(key)
  if (currentCount === null) {
    client.setex(key, duration, 1)
    return { limit, remaining: limit - 1, success: true }
  } else {
    client.incr(key)
    // Ensure that the key will expire after the duration
    client.expire(key, currentCountTTLLeft)
  }
  const count = currentCount ? parseInt(currentCount) : 1
  if (count >= limit) {
    return { limit, remaining: limit - count, success: false }
  }
  return { limit, remaining: limit - (count + 1), success: true }
}

export default rateLimiter

export type IRateLimiterErrorResponse = NextResponse

export const apiRateLimiter = async (
  req: Request,
  options: {
    limitPerInterval: number
    duration: number
  } = {
    limitPerInterval: RATE_LIMIT_PER_INTERVAL,
    duration: RATE_LIMIT_DURATION,
  }
): Promise<
  | {
      headers: Headers
    }
  | never
> => {
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    headers[key] = value
  })
  let identifier = requestIp.getClientIp({
    ...req,
    headers,
  })

  if (!identifier) {
    if (env.ENV !== "development") {
      logger.error("Could not identify IP address.")
      await ApiError("couldNotIdentifyIp", "INTERNAL_SERVER_ERROR")
      throw new Error("Could not identify IP address.")
    } else {
      identifier = "unknown_ip"
    }
  }

  const result = await rateLimiter(identifier, options.limitPerInterval, options.duration)

  if (!result.success) {
    await ApiError("tooManyRequests", "TOO_MANY_REQUESTS")
  }

  return {
    headers: new Headers({
      "X-RateLimit-Limit": `${result.limit}`,
      "X-RateLimit-Remaining": `${result.remaining}`,
      "X-RateLimit-Reset": `${options.duration}`,
    }),
  }
}
