import { NextResponse } from "next/server"
import requestIp from "request-ip"
import { redis as client } from "./redis"

type Result = {
  limit: number
  remaining: number
  success: boolean
}

export const RATE_LIMIT_PER_SECOND = 3
export const RATE_LIMIT_DURATION = 60

const rateLimiter = async (ip: string, limit: number, duration: number): Promise<Result> => {
  const key = `rate_limit:${ip}`
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

export const apiRateLimiter = async (
  req: Request,
  options: {
    limitPerSecond: number
    duration: number
  } = {
    limitPerSecond: RATE_LIMIT_PER_SECOND,
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
      errorResponse: NextResponse
    }
> => {
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    headers[key] = value
  })
  const identifier = requestIp.getClientIp({
    ...req,
    headers,
  })

  if (!identifier) {
    return {
      success: false,
      errorResponse: NextResponse.json("Could not identify your IP address.", { status: 500 }),
    }
  }

  const result = await rateLimiter(identifier, options.limitPerSecond, options.duration)

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
