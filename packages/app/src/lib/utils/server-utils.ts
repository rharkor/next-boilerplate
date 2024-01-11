import { Session } from "next-auth"
import base32Encode from "base32-encode"
import { z } from "zod"

import { ValueOf } from "@/types"
import { logger } from "@lib/logger"
import { Prisma } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc"

import { getDictionary, TDictionary } from "../langs"

import "server-only"

export const parseRequestBody = async <T>(
  req: Request,
  schema: z.Schema<T>
): Promise<{ data?: never; error: ReturnType<typeof ApiError> } | { data: T; error?: never }> => {
  const reqData = (await req.json()) as T
  const bodyParsedResult = schema.safeParse(reqData)
  if (!bodyParsedResult.success)
    return { error: ApiError(bodyParsedResult.error.message as ValueOf<typeof throwableErrorsMessages>) }
  return { data: bodyParsedResult.data }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof TRPCError) {
    return ApiError(error.message as ValueOf<typeof throwableErrorsMessages>, error.code)
  } else {
    logger.error(error)
    if (error instanceof Prisma.PrismaClientValidationError || error instanceof Prisma.PrismaClientKnownRequestError)
      ApiError(throwableErrorsMessages.unknownError, "INTERNAL_SERVER_ERROR")
    else if (error instanceof Error)
      return ApiError(error.message as ValueOf<typeof throwableErrorsMessages>, "INTERNAL_SERVER_ERROR")
    return ApiError(throwableErrorsMessages.unknownError, "INTERNAL_SERVER_ERROR")
  }
}

export function ensureLoggedIn(session: Session | null | undefined): asserts session is Session {
  if (!session) throw ApiError(throwableErrorsMessages.unauthorized, "UNAUTHORIZED")
}

type TValue = string | { [key: string]: TValue }

/*
 * Transform a dictionary into a object of throwable errors
 * source example: { errors: { emailNotVerified: "Email not verified", test: { subKey: "sub key" } } }
 * result example: { emailNotVerified: "emailNotVerified", test: { subKey: "test.subKey" }}
 */
export const throwableErrorsMessages: TDictionary["errors"] = Object.entries((await getDictionary("en")).errors).reduce(
  (acc, [key, value]) => {
    const handleNested = (
      obj: {
        [key: string]: unknown
      },
      key: string,
      realValue: TValue,
      keySum: string
    ) => {
      Object.entries(realValue).forEach(([subKey, subValue]) => {
        if (!obj[key]) obj[key] = {}
        if (typeof subValue === "string") {
          ;(obj[key] as { [key: string]: string })[subKey] = keySum + "." + subKey
        } else {
          handleNested(obj[key] as { [key: string]: string }, subKey, subValue, keySum + "." + subKey)
        }
      })
    }
    if (typeof value === "string") {
      acc[key] = key
    } else {
      handleNested(acc, key, value, key)
    }
    return acc
  },
  {} as { [key: string]: string | unknown }
) as TDictionary["errors"]

//? Verify no duplicate values
if (Object.values(throwableErrorsMessages).length !== new Set(Object.values(throwableErrorsMessages)).size) {
  throw new Error("Duplicate values in throwableErrorsMessages")
}

export function ApiError(message: ValueOf<typeof throwableErrorsMessages>, code?: TRPC_ERROR_CODE_KEY): never {
  throw new TRPCError({
    code: code ?? "BAD_REQUEST",
    message: message.toString(),
  })
}

export const generateRandomSecret = () => {
  const secret = base32Encode(crypto.getRandomValues(new Uint8Array(10)), "RFC4648", { padding: false })
  return secret
}
