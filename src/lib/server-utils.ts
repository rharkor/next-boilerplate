import "server-only"
import { TRPCError } from "@trpc/server"
import { Session } from "next-auth"
import { z } from "zod"
import { logger } from "./logger"
import { ApiError, throwableErrorsMessages } from "./utils"

export const validateSession = async (session: Session): Promise<string | false> => {
  const getResult = async () => {
    if (!session.user.id) return "No user id"
    return false
  }
  const result = await getResult()
  result && logger.debug("validateSession", result)
  return result
}

export const parseRequestBody = async <T>(
  req: Request,
  schema: z.Schema<T>
): Promise<{ data?: never; error: ReturnType<typeof ApiError> } | { data: T; error?: never }> => {
  const reqData = (await req.json()) as T
  const bodyParsedResult = schema.safeParse(reqData)
  if (!bodyParsedResult.success) return { error: ApiError(bodyParsedResult.error.message) }
  return { data: bodyParsedResult.data }
}

export const handleApiError = (error: unknown) => {
  logger.error(error)
  if (error instanceof TRPCError) {
    return ApiError(error.message, error.code)
  } else if (error instanceof Error) {
    return ApiError(error.message, "INTERNAL_SERVER_ERROR")
  } else {
    return ApiError(throwableErrorsMessages.unknownError, "INTERNAL_SERVER_ERROR")
  }
}

export function ensureLoggedIn(session: Session | null | undefined): asserts session is Session {
  if (!session) throw ApiError(throwableErrorsMessages.youAreNotLoggedIn, "UNAUTHORIZED")
}
