import { Prisma } from "@prisma/client"
import { hash } from "@/lib/bcrypt"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { signUpSchema } from "@/lib/schemas/auth"
import { ApiError } from "@/lib/utils"
import { apiInputFromSchema } from "@/types"

export const register = async ({ input }: apiInputFromSchema<typeof signUpSchema>) => {
  const { email, password, username } = signUpSchema().parse(input)
  try {
    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
      },
    })

    return { user }
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const meta = error.meta
        if (!meta) ApiError("Account already exists")
        if ((meta.target as Array<string>).includes("email")) {
          return ApiError("Email already exists")
        } else if ((meta.target as Array<string>).includes("username")) {
          return ApiError("Username already exists")
        }
      }
    }
    logger.error(error)
    if (error instanceof Error) {
      return ApiError(error.message, "INTERNAL_SERVER_ERROR")
    } else {
      return ApiError("An unknown error occurred", "INTERNAL_SERVER_ERROR")
    }
  }
}
