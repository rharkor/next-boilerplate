import { z } from "zod"

import { assetsDirectory, getConfiguration, setConfiguration } from "@/lib/configuration"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { getStoreUID } from "@next-boilerplate/cli-helpers/stores"
import { handleDeleteStore, handleDownloadStore } from "@next-boilerplate/cli-helpers/stores-helpers"

import {
  deleteStoreRequestSchema,
  deleteStoreResponseSchema,
  installOrUpdateStoreRequestSchema,
  installOrUpdateStoreResponseSchema,
} from "./schemas"

export const installOrUpdateStore = async ({
  input: { store },
}: apiInputFromSchema<typeof installOrUpdateStoreRequestSchema>) => {
  try {
    await handleDownloadStore({
      override: true,
      assetsDirectory,
      store,
    })

    const data: z.infer<ReturnType<typeof installOrUpdateStoreResponseSchema>> = { success: true }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export const deleteStore = async ({ input: { store } }: apiInputFromSchema<typeof deleteStoreRequestSchema>) => {
  try {
    const configuration = await getConfiguration()

    // Remove store from configuration
    await setConfiguration({
      ...configuration,
      plugins: configuration.plugins?.filter((p) => getStoreUID(p.store) !== getStoreUID(store)),
      stores: configuration.stores?.filter((s) => getStoreUID(s) !== getStoreUID(store)),
    })

    // Delete form store folder
    await handleDeleteStore({
      assetsDirectory,
      store,
    })

    const data: z.infer<ReturnType<typeof deleteStoreResponseSchema>> = { success: true }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
