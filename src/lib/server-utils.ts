import "server-only"
import { Session } from "next-auth"
import { z } from "zod"
import { logger } from "./logger"
import { ApiError } from "./utils"

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
