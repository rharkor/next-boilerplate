import { useRouter } from "next/navigation"
import { create } from "zustand"
import { logger } from "@/lib/logger"
import { handleFetch } from "@/lib/utils"

export type IOnError = (error: string) => void

export type IFullResponseOptions = {
  onError?: IOnError
  redirectOnUnauthorized?: boolean
}

export interface IApiState {
  router: ReturnType<typeof useRouter>
  apiFetch: (fetchRequest: Promise<Response>, responseOptions?: IOnError | IFullResponseOptions) => Promise<unknown>
}

export const useApiStore = create<IApiState>(() => ({
  router: useRouter(),
  apiFetch: async (fetchRequest, responseOptions) => {
    let onError: IOnError
    if (typeof responseOptions === "function") {
      onError = responseOptions
    } else if (typeof responseOptions === "object" && responseOptions.onError) {
      onError = responseOptions.onError
    } else {
      onError = (error) => logger.error(error)
    }

    let redirectOnUnauthorized: boolean
    if (typeof responseOptions === "object" && responseOptions.redirectOnUnauthorized !== undefined) {
      redirectOnUnauthorized = responseOptions.redirectOnUnauthorized
    } else {
      redirectOnUnauthorized = true
    }

    const res = await handleFetch(fetchRequest, {
      onError,
      redirectOnUnauthorized,
      router: useApiStore.getState().router,
    })
    return res
  },
}))
