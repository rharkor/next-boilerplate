import { z } from "zod"
import { getJsonApiSkip, getJsonApiSort, getJsonApiTake } from "@/lib/json-api"
import { prisma } from "@/lib/prisma"
import { getActiveSessionsResponseSchema, getActiveSessionsSchema } from "@/lib/schemas/user"
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
    const activeSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
      },
      skip,
      take,
      orderBy: getJsonApiSort(input),
    })

    const total = await prisma.session.count({
      where: {
        userId: session.user.id,
      },
    })

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
