import { z } from "zod"

import { getJsonApiSkip, getJsonApiTake } from "@/lib/json-api"
import { redis } from "@/lib/redis"
import { getActiveSessionsResponseSchema, getActiveSessionsSchema, sessionsSchema } from "@/lib/schemas/user"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

export const getActiveSessions = async ({
  input,
  ctx: { session },
}: apiInputFromSchema<typeof getActiveSessionsSchema>) => {
  try {
    ensureLoggedIn(session)

    const skip = getJsonApiSkip(input)
    const take = getJsonApiTake(input)
    const allSessionsKeys = await redis.keys(`session:${session.user.id}:*`)
    const allSessions = await redis.mget(allSessionsKeys)
    const activeSessions = allSessions
      .filter((s) => s)
      .map((s) => JSON.parse(s as string) as z.infer<ReturnType<typeof sessionsSchema>>)
      .sort((a, b) => {
        if (!a.lastUsedAt) return -1
        if (!b.lastUsedAt) return 1
        return a.lastUsedAt > b.lastUsedAt ? -1 : 1
      })
      .slice(skip, skip + take)

    const total = (await redis.keys(`session:${session.user.id}:*`)).length

    const response: z.infer<ReturnType<typeof getActiveSessionsResponseSchema>> = {
      data: activeSessions,
      meta: {
        total: activeSessions.length,
        page: input?.page || 1,
        perPage: take,
        totalPages: Math.ceil(total / take),
      },
    }
    return response
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
