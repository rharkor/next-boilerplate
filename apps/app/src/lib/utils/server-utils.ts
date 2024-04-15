import { cookies } from "next/headers"
import { Session } from "next-auth"
import base32Encode from "base32-encode"

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
