import { NextResponse } from "next/server"
import requestIp from "request-ip"
import { redis as client } from "./redis"

type Result = {
  limit: number
  remaining: number
  expire: number
  success: boolean
}

export const RATE_LIMIT_PER_INTERVAL = 3
export const RATE_LIMIT_DURATION = 60

const rateLimiter = async (ip: string, limit: number, duration: number): Promise<Result> => {
  const key = `rate_limit:${ip}`
  const currentCount = await client.get(key)
  let expire = await client.ttl(key)
  if (expire < 0) expire = 0
  const count = parseInt(currentCount as string, 10) || 0
  if (count >= limit) {
    return { limit, remaining: limit - count, expire, success: false }
  }
  client.incr(key)
  client.expire(key, duration)
  return { limit, remaining: limit - (count + 1), expire, success: true }
}

export default rateLimiter

export const apiRateLimiter = async (
  req: Request,
  options: {
    limitPerInterval: number
    duration: number
    preprendIdentifier?: string
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
      errorResponse: NextResponse
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
    if (process.env.NODE_ENV === "development") identifier = "localhost"
    else
      return {
        success: false,
        errorResponse: NextResponse.json("Could not identify your IP address.", { status: 500 }),
      }
  }

  if (options.preprendIdentifier && options.preprendIdentifier.at(-1) !== ":") {
    options.preprendIdentifier += ":"
  }
  identifier = `${options.preprendIdentifier || ""}${identifier}`

  const result = await rateLimiter(identifier, options.limitPerInterval, options.duration)

  if (!result.success) {
    return {
      success: false,
      errorResponse: NextResponse.json("Too many requests. Please try again in a few minutes.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": `${result.limit}`,
          "X-RateLimit-Remaining": `${result.remaining}`,
          "X-RateLimit-Reset": `${result.expire}`,
        },
      }),
    }
  }

  return {
    success: true,
    headers: new Headers({
      "X-RateLimit-Limit": `${result.limit}`,
      "X-RateLimit-Remaining": `${result.remaining}`,
      "X-RateLimit-Reset": `${result.expire}`,
    }),
  }
}

export const mergeRateLimitHeaders = (headers: Headers, newHeaders: Headers) => {
  const minRateLimitActual = headers.get("X-RateLimit-Limit")
  const minRateLimitNewHeaders = headers.get("X-RateLimit-Remaining")
  if (
    minRateLimitNewHeaders &&
    parseInt(minRateLimitActual as string, 10) > parseInt(minRateLimitNewHeaders as string, 10)
  ) {
    headers.set("X-RateLimit-Limit", minRateLimitNewHeaders)
    headers.set("X-RateLimit-Remaining", newHeaders.get("X-RateLimit-Remaining") as string)
    headers.set("X-RateLimit-Reset", newHeaders.get("X-RateLimit-Reset") as string)
  }
  return newHeaders
}
