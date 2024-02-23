import { Session } from "next-auth"
import base32Encode from "base32-encode"
import { z } from "zod"

import { Path } from "@/types"
import { logger } from "@lib/logger"
import { Prisma } from "@prisma/client"
import { TRPCError } from "@trpc/server"
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc"

import { TDictionary } from "../langs"

export const parseRequestBody = async <T>(
  req: Request,
  schema: z.Schema<T>
): Promise<{ data?: never; error: ReturnType<typeof ApiError> } | { data: T; error?: never }> => {
  const reqData = (await req.json()) as T
  const bodyParsedResult = schema.safeParse(reqData)
  if (!bodyParsedResult.success)
    return { error: ApiError(bodyParsedResult.error.message as Path<TDictionary["errors"]>) }
  return { data: bodyParsedResult.data }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof TRPCError) {
    throw error
  } else {
    logger.trace(error)
    if (error instanceof Prisma.PrismaClientValidationError || error instanceof Prisma.PrismaClientKnownRequestError)
      ApiError("unknownError", "INTERNAL_SERVER_ERROR")
    else if (error instanceof Error)
      return ApiError(error.message as Path<TDictionary["errors"]>, "INTERNAL_SERVER_ERROR")
    return ApiError("unknownError", "INTERNAL_SERVER_ERROR")
  }
}

export function ensureLoggedIn(session: Session | null | undefined): asserts session is Session {
  if (!session) throw ApiError("unauthorized", "UNAUTHORIZED")
}

export type TErrorMessage = {
  message: string
  extra?: object
}

export function ApiError(message: Path<TDictionary["errors"]>, code?: TRPC_ERROR_CODE_KEY, extra?: object): never {
  const data: TErrorMessage = { message, extra }
  throw new TRPCError({
    code: code ?? "BAD_REQUEST",
    message: JSON.stringify(data),
  })
}

export const generateRandomSecret = () => {
  const secret = base32Encode(crypto.getRandomValues(new Uint8Array(10)), "RFC4648", { padding: false })
  return secret
}
