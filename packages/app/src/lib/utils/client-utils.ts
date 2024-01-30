import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { env } from "env.mjs"
import { toast } from "react-toastify"

import { logger } from "@lib/logger"
import { TRPCClientErrorLike } from "@trpc/client"

import { AppRouter } from "../../api/_app"
import { TDictionary } from "../langs"

import { handleApiError } from "."

import "client-only"

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
  logger.error("Query error:", resp.message)
  if (opts.showNotification) {
    toast.error(resp.message, {
      toastId: error.message,
    })
  }
  return resp
}

export const handleMutationError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance,
  opts: TOptions = { showNotification: true }
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Mutation error:", resp.message)
  if (opts.showNotification) {
    toast.error(resp.message, {
      toastId: error.message,
    })
  }
  return resp
}

export const getImageUrl = (imageKey: string | undefined | null) => {
  if (!imageKey || imageKey.startsWith("https://")) return imageKey
  return (
    (env.NEXT_PUBLIC_S3_ENDPOINT ?? "").replace("https://", "https://" + env.NEXT_PUBLIC_S3_BUCKET_NAME + ".") +
    "/" +
    imageKey
  )
}
