import { Prisma } from "@prisma/client"
import { hash } from "@/lib/bcrypt"
import { prisma } from "@/lib/prisma"
import { signUpSchema } from "@/lib/schemas/auth"
import { ApiError, throwableErrorsMessages } from "@/lib/utils"
import { handleApiError } from "@/lib/utils/server-utils"
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
        if (!meta) ApiError(throwableErrorsMessages.accountAlreadyExists)
        if ((meta.target as Array<string>).includes("email")) {
          return ApiError(throwableErrorsMessages.emailAlreadyExists)
        } else if ((meta.target as Array<string>).includes("username")) {
          return ApiError(throwableErrorsMessages.usernameAlreadyExists)
        }
      }
    }
    return handleApiError(error)
  }
}
