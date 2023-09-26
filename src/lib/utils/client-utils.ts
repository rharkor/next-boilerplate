import { TRPCClientErrorLike } from "@trpc/client"
import "client-only"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"

import { toast } from "react-toastify"
import { AppRouter } from "../../api/_app"
import { TDictionary } from "../langs"
import { logger } from "../logger"
import { handleApiError } from "."

export const handleQueryError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Query error:", resp)
  toast.error(resp.message)
  return resp
}

export const handleMutationError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Mutation error:", resp)
  toast.error(resp.message)
  return resp
}
