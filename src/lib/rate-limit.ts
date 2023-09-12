import { NextResponse } from "next/server"
import requestIp from "request-ip"
import { logger } from "./logger"
import { redis as client } from "./redis"

type Result = {
  limit: number
  remaining: number
  success: boolean
}

export const RATE_LIMIT_PER_INTERVAL = 120
export const RATE_LIMIT_DURATION = 30

const rateLimiter = async (identifier: string, limit: number, duration: number): Promise<Result> => {
  const key = `rate_limit:${identifier}`
  const currentCount = await client.get(key)
  const count = parseInt(currentCount as string, 10) || 0
  if (count >= limit) {
    return { limit, remaining: limit - count, success: false }
  }
  client.incr(key)
  client.expire(key, duration)
  return { limit, remaining: limit - (count + 1), success: true }
}

export default rateLimiter

export type IRateLimiterErrorResponse = NextResponse

export const apiRateLimiter = async (
  req: Request,
  options: {
    limitPerInterval: number
    duration: number
    prependIdentifier?: string
  } = {
    limitPerInterval: RATE_LIMIT_PER_INTERVAL,
    duration: RATE_LIMIT_DURATION,
  }
): Promise<
  | {
      success: true
      headers: Headers
      errorResponse?: undefined
    }
  | {
      success: false
      headers?: undefined
      errorResponse: IRateLimiterErrorResponse
    }
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
    if (process.env.NODE_ENV !== "development" && process.env.ENV !== "development") {
      logger.error("Could not identify IP address.")
      return {
        success: false,
        errorResponse: NextResponse.json("Could not identify your IP address.", { status: 500 }),
      }
    } else {
      identifier = "unknown_ip"
    }
  }

  const result = await rateLimiter(
    identifier + (options.prependIdentifier || ""),
    options.limitPerInterval,
    options.duration
  )

  if (!result.success) {
    return {
      success: false,
      errorResponse: NextResponse.json("Too many requests. Please try again in a few minutes.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": `${result.limit}`,
          "X-RateLimit-Remaining": `${result.remaining}`,
          "X-RateLimit-Reset": `${options.duration}`,
        },
      }),
    }
  }

  return {
    success: true,
    headers: new Headers({
      "X-RateLimit-Limit": `${result.limit}`,
      "X-RateLimit-Remaining": `${result.remaining}`,
      "X-RateLimit-Reset": `${options.duration}`,
    }),
  }
}
