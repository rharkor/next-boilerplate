import { useRouter } from "next/navigation"

import { toast } from "react-toastify"

import { logger } from "@rharkor/logger"
import { TRPCClientErrorLike } from "@trpc/client"

import { AppRouter } from "../../api/_app"
import { TDictionary } from "../langs"

import { handleApiError } from "."

type TOptions = {
  showNotification?: boolean // default true
}

type AppRouterInstance = ReturnType<typeof useRouter>

export const handleQueryError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary<{
    unknownError: true
  }>,
  router: AppRouterInstance,
  opts: TOptions = { showNotification: true }
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Query error:", resp)
  if (opts.showNotification) {
    toast.error(resp.message, {
      toastId: error.message,
    })
  }
  return resp
}

export const handleMutationError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary<{
    unknownError: true
  }>,
  router: AppRouterInstance,
  opts: TOptions = { showNotification: true }
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Mutation error:", resp)
  if (opts.showNotification) {
    toast.error(resp.message, {
      toastId: error.message,
    })
  }
  return resp
}
