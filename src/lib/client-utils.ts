import { TRPCClientErrorLike } from "@trpc/client"
import "client-only"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"
import { toast } from "@/components/ui/use-toast"
import { TDictionary } from "./langs"
import { logger } from "./logger"
import { AppRouter } from "./server/routers/_app"
import { handleApiError } from "./utils"

export const handleQueryError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Query error:", resp)
  toast({
    title: "Error",
    description: resp.message,
    variant: "destructive",
  })
  return resp
}

export const handleMutationError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance
): T => {
  const resp = handleApiError(error, dictionary, router)
  logger.error("Mutation error:", resp)
  toast({
    title: dictionary.error,
    description: resp.message,
    variant: "destructive",
  })
  return resp
}
