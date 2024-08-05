import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { Session } from "next-auth"
import base32Encode from "base32-encode"
import { ZodError } from "zod"

import { Path } from "@/types"
import { logger } from "@next-boilerplate/lib"
import { Prisma } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc"

import { i18n, Locale } from "../i18n-config"
import { _getDictionary, TDictionary } from "../langs"

import { findNestedKeyInDictionary } from "."

export const handleApiError = (error: unknown) => {
  if (error instanceof TRPCError) {
    throw error
  } else {
    logger.trace(error)
    if (error instanceof Prisma.PrismaClientValidationError || error instanceof Prisma.PrismaClientKnownRequestError)
      return ApiError("unknownError", "INTERNAL_SERVER_ERROR")
    else if (error instanceof Error)
      return ApiError(error.message as Path<TDictionary<undefined, "errors">>, "INTERNAL_SERVER_ERROR")
    return ApiError("unknownError", "INTERNAL_SERVER_ERROR")
  }
}

export const ERROR_CODES_BY_KEY = {
  PARSE_ERROR: 400,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_SUPPORTED: 405,
  TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  UNSUPPORTED_MEDIA_TYPE: 415,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
} as const

export const handleNextApiError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.errors }, { status: 400 })
  } else if (error instanceof TRPCError) {
    try {
      const content = JSON.parse(error.message)
      return NextResponse.json({ error: content }, { status: ERROR_CODES_BY_KEY[error.code] })
    } catch (e) {
      return NextResponse.json({ error: error.message }, { status: ERROR_CODES_BY_KEY[error.code] })
    }
  } else {
    logger.trace(error)
    return NextResponse.json({ error: "unknownError" }, { status: 500 })
  }
}

export function ensureLoggedIn(session: Session | null | undefined): asserts session is Session {
  if (!session) {
    const data: TErrorMessage = { message: "You must be logged in to access this resource", code: "UNAUTHORIZED" }
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: JSON.stringify(data),
    })
  }
}

export type TErrorMessage = {
  message: string
  code: string
  extra?: object
}

export async function ApiError(
  messageCode: Path<TDictionary<undefined, "errors">>,
  code?: TRPC_ERROR_CODE_KEY,
  extra?: object
): Promise<never> {
  const cookiesStore = cookies()
  const lang = cookiesStore.get("saved-locale")?.value ?? i18n.defaultLocale
  const dictionary = await _getDictionary("errors", lang as Locale, undefined)
  let message = findNestedKeyInDictionary(messageCode, dictionary)
  if (!message) {
    logger.error(new Error(`Error not found in dictionary: ${messageCode}`))
    message = dictionary.unknownError
  }
  const data: TErrorMessage = { message, code: messageCode, extra }
  throw new TRPCError({
    code: code ?? "BAD_REQUEST",
    message: JSON.stringify(data),
  })
}

export const generateRandomSecret = () => {
  const secret = base32Encode(crypto.getRandomValues(new Uint8Array(10)), "RFC4648", { padding: false })
  return secret
}

type TRequirements =
  | {
      authenticated?: false
    }
  | {
      authenticated: true
      admin?: boolean
    }

type TReturnType<T extends TRequirements> = T extends { authenticated: true } ? Session : undefined

export const apiMiddleware = async <T extends TRequirements>(
  session: Session | null,
  requirements: T
): Promise<TReturnType<T>> => {
  if (requirements.authenticated === true) {
    if (!session) {
      return ApiError("unauthorized", "UNAUTHORIZED")
    }

    if (requirements.admin && !session.user.isAdmin) {
      return ApiError("forbidden", "FORBIDDEN")
    }

    return session as TReturnType<T>
  }
  return undefined as TReturnType<T>
}
