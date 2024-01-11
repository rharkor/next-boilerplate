import * as bip39 from "bip39"
import { randomUUID } from "crypto"
import { env } from "env.mjs"
import { authenticator } from "otplib"
import { z } from "zod"

import { hash } from "@/lib/bcrypt"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import {
  desactivateTotpSchema,
  generateTotpSecretResponseSchema,
  recover2FASchema,
  signUpSchema,
  verifyTotpSchema,
} from "@/lib/schemas/auth"
import { html, plainText, subject } from "@/lib/templates/mail/verify-email"
import { ApiError, ensureLoggedIn, generateRandomSecret, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { emailVerificationExpiration, rolesAsObject } from "@/types/constants"
import { logger } from "@lib/logger"
import { Prisma } from "@prisma/client"

export const register = async ({ input }: apiInputFromSchema<typeof signUpSchema>) => {
  const { email, password, username } = input
  try {
    if (env.ENABLE_REGISTRATION === false) {
      return ApiError("registrationDisabled")
    }
    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        lastLocale: input.locale,
      },
    })
    await redis.set(`lastLocale:${user.id}`, input.locale)

    //* Send verification email
    if (env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE === true) {
      const token = randomUUID()
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
        text: plainText(url, input.locale),
        html: html(url, input.locale),
      })
    } else {
      logger.debug("Email verification disabled, skipping email sending on registration")
    }

    return { user }
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const meta = error.meta
        if (!meta) ApiError("accountAlreadyExists")
        if ((meta.target as Array<string>).includes("email")) {
          return ApiError("email.exist")
        } else if ((meta.target as Array<string>).includes("username")) {
          return ApiError("username.exist")
        }
      }
    }
    return handleApiError(error)
  }
}

export const generateTotpSecret = async ({ ctx: { session } }: apiInputFromSchema<typeof undefined>) => {
  ensureLoggedIn(session)
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    })
    if (!user) return ApiError("userNotFound")
    if (env.NEXT_PUBLIC_IS_DEMO && user.role === rolesAsObject.admin) return ApiError("demoAdminCannotHaveOtpSecret")
    if (user.otpSecret && user.otpVerified) return ApiError("otpSecretAlreadyExists")
    const secret = generateRandomSecret()
    let mnemonic = bip39.generateMnemonic()
    let it = 0
    //? Check if mnemonic doesnt contain two words that are the same
    while (mnemonic.split(" ").length !== new Set(mnemonic.split(" ")).size) {
      mnemonic = bip39.generateMnemonic()
      it++
      if (it > 100) throw new Error("Could not generate a valid mnemonic")
    }
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        otpSecret: secret,
        otpMnemonic: mnemonic,
      },
    })
    if (!user.email) return ApiError("unknownError")
    const response: z.infer<ReturnType<typeof generateTotpSecretResponseSchema>> = {
      success: true,
      url: authenticator.keyuri(user.email, "#{PROJECT_NAME}#", secret),
      mnemonic,
    }
    return response
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const verifyTotp = async ({ input, ctx: { session } }: apiInputFromSchema<typeof verifyTotpSchema>) => {
  ensureLoggedIn(session)
  try {
    const { token } = verifyTotpSchema().parse(input)
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    })
    if (!user) return ApiError("userNotFound")
    if (!user.otpSecret) return ApiError("otpSecretNotFound")
    const isValid = authenticator.check(token, user.otpSecret)
    if (user.otpVerified === false && isValid) {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          otpVerified: true,
        },
      })
    }
    if (!isValid) return ApiError("otpInvalid")
    return { success: true }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const desactivateTotp = async ({
  ctx: { session },
  input,
}: apiInputFromSchema<typeof desactivateTotpSchema>) => {
  ensureLoggedIn(session)
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    })
    if (!user) return ApiError("userNotFound")
    if (!user.otpSecret) return ApiError("otpSecretNotFound")
    const isValid = authenticator.check(input.token, user.otpSecret)
    if (!isValid) return ApiError("otpInvalid")
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        otpSecret: "",
        otpMnemonic: "",
        otpVerified: false,
      },
    })
    return { success: true }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const recover2FA = async ({ input }: apiInputFromSchema<typeof recover2FASchema>) => {
  try {
    const { email, mnemonic } = recover2FASchema().parse(input)
    const tries = await redis.get(`recover2FA:${email.toLowerCase()}`)
    if (tries && Number(tries) > 5) return ApiError("tooManyAttempts")
    await redis.setex(`recover2FA:${email.toLowerCase()}`, 60 * 60, Number(tries) + 1) //? 1 hour
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
    })
    if (!user) return ApiError("invalidCredentials")
    if (!user.otpSecret) return ApiError("invalidCredentials")
    const isValid = mnemonic === user.otpMnemonic
    if (!isValid) return ApiError("invalidCredentials")
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        otpSecret: "",
        otpMnemonic: "",
        otpVerified: false,
      },
    })
    return { success: true }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
