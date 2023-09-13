import { prisma } from "@/lib/prisma"
import { deleteSessionSchema } from "@/lib/schemas/user"
import { ensureLoggedIn, handleApiError } from "@/lib/server-utils"
import { apiInputFromSchema } from "@/types"

export const deleteSession = async ({ input, ctx: { session } }: apiInputFromSchema<typeof deleteSessionSchema>) => {
  try {
    ensureLoggedIn(session)
    const { id } = deleteSessionSchema().parse(input)
    //* Delete session
    const deletedSession = await prisma.session.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    return { id: deletedSession.id }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
