import { redis } from "@/lib/redis"
import { deleteSessionSchema } from "@/lib/schemas/user"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

export const deleteSession = async ({ input, ctx: { session } }: apiInputFromSchema<typeof deleteSessionSchema>) => {
  try {
    ensureLoggedIn(session)
    const { id } = input
    //* Delete session
    await redis.del(`session:${session.user.id}:${id}`)

    return { id }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
