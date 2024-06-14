import { randomUUID } from "crypto"
import { z } from "zod"

import { forgotPasswordSchema, resetPasswordResponseSchema, resetPasswordSchema } from "@/api/me/schemas"
import { resendResetPasswordExpiration, resetPasswordExpiration, rolesAsObject } from "@/constants"
import { logoUrl } from "@/constants/medias"
import { hash } from "@/lib/bcrypt"
import { env } from "@/lib/env"
import { i18n, Locale } from "@/lib/i18n-config"
import { _getDictionary } from "@/lib/langs"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import { ApiError, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { logger } from "@next-boilerplate/lib"
import ResetPasswordTemplate from "@next-boilerplate/transactional/emails/reset-password"
import { render } from "@react-email/render"

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

    const resetLink = `${env.VERCEL_URL ?? env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetPasswordToken}`
    const locale = (user.lastLocale as Locale) ?? i18n.defaultLocale
    const mailDict = await _getDictionary("transactionals", locale, {
      footer: true,
      resetPasswordRequest: true,
      resetYourPassword: true,
      resetPasswordDescription: true,
      hey: true,
    })
    const element = ResetPasswordTemplate({
      footerText: mailDict.footer,
      logoUrl: logoUrl,
      actionText: mailDict.resetYourPassword,
      contentTitle: mailDict.resetPasswordDescription,
      heyText: mailDict.hey,
      name: user.name ?? "",
      previewText: mailDict.resetPasswordRequest,
      resetLink,
      supportEmail: env.SUPPORT_EMAIL ?? "",
      titleText: mailDict.resetYourPassword,
    })
    const text = render(element, {
      plainText: true,
    })
    const html = render(element)
    await sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: mailDict.resetYourPassword,
      text,
      html,
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

    const data: z.infer<ReturnType<typeof resetPasswordResponseSchema>> = { success: true }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
