import { randomUUID } from "crypto"
import { env } from "env.mjs"
import { i18n } from "i18n-config"

import { hash } from "@/lib/bcrypt"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/schemas/user"
import { html, plainText, subject } from "@/lib/templates/mail/reset-password"
import { ApiError, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { resendResetPasswordExpiration, resetPasswordExpiration, rolesAsObject } from "@/types/constants"
import { logger } from "@lib/logger"

export const forgotPassword = async ({ input }: apiInputFromSchema<typeof forgotPasswordSchema>) => {
  try {
    const { email } = input
    //? Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    // if (!user) return ApiError("userNotFound", "NOT_FOUND")
    if (!user) {
      logger.debug("User not found")
      return { email }
    }
    if (!user.hasPassword) return ApiError("userDoesNotHaveAPassword", "BAD_REQUEST")

    const resetPassordToken = await prisma.resetPassordToken.findFirst({
      where: {
        identifier: user.id,
      },
    })

    //? Too recent
    if (resetPassordToken && resetPassordToken.createdAt > new Date(Date.now() - resendResetPasswordExpiration)) {
      return ApiError("emailAlreadySentPleaseTryAgainInFewMinutes", "BAD_REQUEST")
    }

    if (resetPassordToken) {
      await prisma.resetPassordToken.delete({
        where: {
          identifier: resetPassordToken.identifier,
        },
      })
    }

    const resetPasswordToken = randomUUID()
    await prisma.resetPassordToken.create({
      data: {
        token: resetPasswordToken,
        expires: new Date(Date.now() + resetPasswordExpiration),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    await sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: subject,
      text: plainText(
        user.username ?? email,
        `${env.VERCEL_URL ?? env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetPasswordToken}`,
        user.lastLocale ?? i18n.defaultLocale
      ),
      html: html(
        user.username ?? email,
        `${env.VERCEL_URL ?? env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetPasswordToken}`,
        user.lastLocale ?? i18n.defaultLocale
      ),
    })

    return { email }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const resetPassword = async ({ input }: apiInputFromSchema<typeof resetPasswordSchema>) => {
  try {
    const { token, password } = input
    const resetPassordToken = await prisma.resetPassordToken.findUnique({
      where: {
        token,
      },
      include: {
        user: true,
      },
    })
    if (!resetPassordToken) return ApiError("tokenNotFound", "NOT_FOUND")
    await prisma.resetPassordToken.delete({
      where: {
        identifier: resetPassordToken.identifier,
      },
    })
    if (resetPassordToken.expires < new Date()) return ApiError("tokenExpired", "BAD_REQUEST")

    if (resetPassordToken.user.role === rolesAsObject.admin && env.NEXT_PUBLIC_IS_DEMO === true)
      return ApiError("cannotResetAdminPasswordInDemoMode", "BAD_REQUEST")

    await prisma.user.update({
      where: {
        id: resetPassordToken.user.id,
      },
      data: {
        password: await hash(password, 12),
      },
    })

    return { user: resetPassordToken.user }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
