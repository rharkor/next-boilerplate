import { TRPCClientErrorLike } from "@trpc/client"
import "client-only"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

import { toast } from "react-toastify"
import { AppRouter } from "../../api/_app"
import { TDictionary } from "../langs"
import { logger } from "../logger"
import { handleApiError } from "."

type TOptions = {
  showNotification?: boolean // default true
}

export const handleQueryError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance,
  opts: TOptions = { showNotification: true }
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Query error:", resp)
  if (opts.showNotification) toast.error(resp.message)
  return resp
}

export const handleMutationError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance,
  opts: TOptions = { showNotification: true }
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Mutation error:", resp)
  if (opts.showNotification) toast.error(resp.message)
  return resp
}
