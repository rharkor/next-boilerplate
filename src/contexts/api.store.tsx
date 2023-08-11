import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"
import { create } from "zustand"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { handleFetch } from "@/lib/utils"

export type IOnError = (error: string) => void

export type IFullResponseOptions = {
  onError?: IOnError
  redirectOnUnauthorized?: boolean
}

export interface IApiState {
  apiFetch: (
    router: AppRouterInstance
  ) => (
    fetchRequest: Promise<Response>,
    dictionary: TDictionary,
    responseOptions?: IOnError | IFullResponseOptions
  ) => Promise<unknown>
}

export const useApiStore = create<IApiState>(() => ({
  apiFetch: (router) => async (fetchRequest, dictionary, responseOptions) => {
    let onError: IOnError
    if (typeof responseOptions === "function") {
      onError = responseOptions
    } else if (typeof responseOptions === "object" && responseOptions.onError) {
      onError = responseOptions.onError
    } else {
      onError = (error) => logger.error(error)
    }

    const onResponse = async (res: Response) => {
      const { url, status } = res
      logger.debug("api called", url, "received status", status)
    }

    let redirectOnUnauthorized: boolean
    if (typeof responseOptions === "object" && responseOptions.redirectOnUnauthorized !== undefined) {
      redirectOnUnauthorized = responseOptions.redirectOnUnauthorized
    } else {
      redirectOnUnauthorized = true
    }

    const res = await handleFetch(
      fetchRequest,
      {
        onError,
        onResponse,
        redirectOnUnauthorized,
        router,
      },
      dictionary
    )
    return res
  },
}))
