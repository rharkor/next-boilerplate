import "server-only"
import { TRPCError } from "@trpc/server"
import { Session } from "next-auth"
import { z } from "zod"
import { ValueOf } from "@/types"
import { logger } from "../logger"
import { ApiError, throwableErrorsMessages } from "."

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
  if (!bodyParsedResult.success)
    return { error: ApiError(bodyParsedResult.error.message as ValueOf<typeof throwableErrorsMessages>) }
  return { data: bodyParsedResult.data }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof TRPCError) {
    return ApiError(error.message as ValueOf<typeof throwableErrorsMessages>, error.code)
  } else {
    logger.error(error)
    if (error instanceof Error)
      return ApiError(error.message as ValueOf<typeof throwableErrorsMessages>, "INTERNAL_SERVER_ERROR")
    return ApiError(throwableErrorsMessages.unknownError, "INTERNAL_SERVER_ERROR")
  }
}

export function ensureLoggedIn(session: Session | null | undefined): asserts session is Session {
  if (!session) throw ApiError(throwableErrorsMessages.youAreNotLoggedIn, "UNAUTHORIZED")
}
