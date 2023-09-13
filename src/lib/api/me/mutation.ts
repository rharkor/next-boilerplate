import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { updateUserSchema } from "@/lib/schemas/user"
import { ApiError } from "@/lib/utils"
import { apiInputFromSchema } from "@/types"

export const updateUser = async ({ input, ctx: { session } }: apiInputFromSchema<typeof updateUserSchema>) => {
  if (!session) return ApiError("You are not logged in", "UNAUTHORIZED")
  const { username } = updateUserSchema().parse(input)
  try {
    //* Update the user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
      },
    })

    return { user }
  } catch (error: unknown) {
    logger.error(error)
    if (error instanceof Error) {
      return ApiError(error.message, "INTERNAL_SERVER_ERROR")
    } else {
      return ApiError("An unknown error occurred", "INTERNAL_SERVER_ERROR")
    }
  }
}
