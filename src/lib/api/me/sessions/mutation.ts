import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { deleteSessionSchema } from "@/lib/schemas/user"
import { ApiError } from "@/lib/utils"
import { apiInputFromSchema } from "@/types"

export const deleteSession = async ({ input, ctx: { session } }: apiInputFromSchema<typeof deleteSessionSchema>) => {
  if (!session) return ApiError("You are not logged in", "UNAUTHORIZED")
  const { id } = deleteSessionSchema().parse(input)
  try {
    //* Delete session
    const deletedSession = await prisma.session.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    return { id: deletedSession.id }
  } catch (error: unknown) {
    logger.error(error)
    if (error instanceof Error) {
      return ApiError(error.message, "INTERNAL_SERVER_ERROR")
    } else {
      return ApiError("An unknown error occurred", "INTERNAL_SERVER_ERROR")
    }
  }
}
