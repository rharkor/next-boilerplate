import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { sessionsSchema } from "@/api/me/schemas"
import { authRoutes } from "@/constants/auth"
import { nextAuthOptions } from "@/lib/auth"
import { redis } from "@/lib/redis"
import { logger } from "@next-boilerplate/lib"

export default async function requireAuth(callbackUrl?: string) {
  const session = await getServerSession(nextAuthOptions)
  if (!session) {
    let searchParams = ""
    if (callbackUrl) {
      searchParams = "?" + new URLSearchParams({ callbackUrl }).toString()
    } else {
      const baseUrl = headers().get("x-url")
      if (!baseUrl) {
        logger.warn("No base url found in headers")
      } else {
        const url = new URL(baseUrl)
        searchParams = "?" + new URLSearchParams({ callbackUrl: url.pathname }).toString()
      }
    }
    redirect(authRoutes.signIn[0] + searchParams)
  }

  return session
}

export async function getAuthApi() {
  const session = await getServerSession(nextAuthOptions)
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  //* Verify that the session still exists
  if (session.user?.uuid) {
    const id = session.user.id
    const uuid = session.user.uuid
    const getRedisSession = async () => {
      const key = `session:${id}:${uuid}`
      const loginSession = await redis.get(key)
      if (!loginSession) {
        logger.debug("Session not found", uuid)
        return true
      }

      //* Save last used at
      //? Only if lastUsedAt is older than 1 minute (avoid spamming the redis server)
      const data = JSON.parse(loginSession) as z.infer<ReturnType<typeof sessionsSchema>>
      if (data.lastUsedAt) {
        const lastUsedAt = new Date(data.lastUsedAt)
        const now = new Date()
        const diff = now.getTime() - lastUsedAt.getTime()
        if (diff > 1000 * 60) {
          return
        }
      }
      //? Update session lastUsed
      const remainingTtl = await redis.ttl(key)
      //! Do not await to make the requests faster
      redis.setex(
        key,
        remainingTtl,
        JSON.stringify({
          ...(JSON.parse(loginSession) as object),
          lastUsedAt: new Date(),
        })
      )
      return
    }
    const res = await getRedisSession()

    // If res is true it means that the session is not found
    if (res === true) {
      return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    }
  }

  return { session, error: null }
}
