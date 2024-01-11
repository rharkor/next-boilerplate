import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/utils/server-utils"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

export const getAccount = async ({ ctx: { session } }: apiInputFromSchema<undefined>) => {
  try {
    ensureLoggedIn(session)

    const account = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })
    if (!account) return ApiError("userNotFound", "NOT_FOUND")
    return { user: account }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
