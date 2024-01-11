import { randomUUID } from "crypto"
import { env } from "env.mjs"
import { i18n } from "i18n-config"

import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmailSchema, verifyEmailSchema } from "@/lib/schemas/user"
import { html, plainText, subject } from "@/lib/templates/mail/verify-email"
import { ApiError, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { emailVerificationExpiration, resendEmailVerificationExpiration } from "@/types/constants"
import { logger } from "@lib/logger"

export const sendVerificationEmail = async ({ input }: apiInputFromSchema<typeof sendVerificationEmailSchema>) => {
  try {
    const { silent, email: iEmail, user: iUser } = input
    const email = (iUser ? iUser.email?.toLowerCase() : iEmail?.toLowerCase()) ?? ""
    const user = iUser ?? (await prisma.user.findUnique({ where: { email } }))

    const token = randomUUID()

    if (!user) {
      logger.debug("User not found")
      return { email }
    }

    if (user.emailVerified) {
      if (silent) return { email }
      logger.debug("User email already verified")
      return ApiError("emailAlreadyVerified", "BAD_REQUEST")
    }

    const userEmailVerificationToken = await prisma.userEmailVerificationToken.findFirst({
      where: {
        identifier: user.id,
      },
    })
    if (userEmailVerificationToken) {
      //? If silent, return early
      if (silent) return { email }

      const isToRecent = userEmailVerificationToken.createdAt.getTime() + resendEmailVerificationExpiration > Date.now()
      if (isToRecent) {
        if (logger.allowDebug) {
          const availableIn = Math.round(
            (userEmailVerificationToken.createdAt.getTime() + resendEmailVerificationExpiration - Date.now()) / 1000
          )
          logger.debug("Verification email already sent: ", availableIn, "seconds left")
        }
        return ApiError("emailAlreadySentPleaseTryAgainInFewMinutes", "BAD_REQUEST")
      }
      await prisma.userEmailVerificationToken.delete({
        where: {
          identifier: userEmailVerificationToken.identifier,
        },
      })
    }

    if (env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE === true) {
      await prisma.userEmailVerificationToken.create({
        data: {
          identifier: user.id,
          token: token,
          expires: new Date(Date.now() + emailVerificationExpiration),
        },
      })
      const url = `${env.VERCEL_URL ?? env.NEXT_PUBLIC_BASE_URL}/verify-email/${token}`
      await sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: email.toLowerCase(),
        subject: subject,
        text: plainText(url, user.lastLocale ?? i18n.defaultLocale),
        html: html(url, user.lastLocale ?? i18n.defaultLocale),
      })
    } else {
      logger.debug("Email verification disabled")
      if (silent) return { email }
      return ApiError("emailServiceDisabled", "PRECONDITION_FAILED")
    }

    return { email }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const verifyEmail = async ({ input }: apiInputFromSchema<typeof verifyEmailSchema>) => {
  try {
    const { token } = input

    const userEmailVerificationToken = await prisma.userEmailVerificationToken.findUnique({
      where: {
        token: token,
      },
    })
    if (!userEmailVerificationToken) {
      logger.debug("Token not found")
      return ApiError("tokenNotFound", "BAD_REQUEST")
    }

    await prisma.userEmailVerificationToken.delete({
      where: {
        identifier: userEmailVerificationToken.identifier,
      },
    })

    if (userEmailVerificationToken.expires.getTime() < Date.now()) {
      logger.debug("Token expired")
      return ApiError("tokenExpired", "BAD_REQUEST")
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userEmailVerificationToken.identifier,
      },
    })
    if (!user) {
      logger.debug("User not found")
      return ApiError("userNotFound", "BAD_REQUEST")
    }

    if (user.emailVerified) {
      logger.debug("User email already verified")
      return ApiError("emailAlreadyVerified", "BAD_REQUEST")
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    })

    return {
      user,
    }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
