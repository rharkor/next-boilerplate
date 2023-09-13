import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/utils"
import { apiInputFromSchema } from "@/types"

export const getAccount = async ({ ctx: { session } }: apiInputFromSchema<undefined>) => {
  if (!session) return ApiError("You are not logged in", "UNAUTHORIZED")

  const account = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })
  if (!account) return ApiError("User not found", "NOT_FOUND")
  return { user: account }
}
