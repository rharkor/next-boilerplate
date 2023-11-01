import { Prisma } from "@prisma/client"
import { randomUUID } from "crypto"
import { hash } from "@/lib/bcrypt"
import { logger } from "@/lib/logger"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import { signUpSchema } from "@/lib/schemas/auth"
import { html, plainText, subject } from "@/lib/templates/mail/verify-email"
import { ApiError, handleApiError, throwableErrorsMessages } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { emailVerificationExpiration } from "@/types/constants"
import { env } from "env.mjs"

export const register = async ({ input }: apiInputFromSchema<typeof signUpSchema>) => {
  const { email, password, username } = input
  try {
    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
      },
    })

    //* Send verification email
    if (env.ENABLE_MAILING_SERVICE === true) {
      const token = randomUUID()
      await prisma.userEmailVerificationToken.create({
        data: {
          identifier: user.id,
          token: token,
          expires: new Date(Date.now() + emailVerificationExpiration),
        },
      })
      const url = `${env.VERCEL_URL ?? env.BASE_URL}/verify-email/${token}`
      await sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: email.toLowerCase(),
        subject: subject,
        text: plainText(url),
        html: html(url),
      })
    } else {
      logger.debug("Email verification disabled, skipping email sending on registration")
    }

    return { user }
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const meta = error.meta
        if (!meta) ApiError(throwableErrorsMessages.accountAlreadyExists)
        if ((meta.target as Array<string>).includes("email")) {
          return ApiError(throwableErrorsMessages.email.exist)
        } else if ((meta.target as Array<string>).includes("username")) {
          return ApiError(throwableErrorsMessages.username.exist)
        }
      }
    }
    return handleApiError(error)
  }
}
