import { z } from "zod"

import { assetsDirectory, getConfiguration, setConfiguration } from "@/lib/configuration"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { handleDeleteStore, handleDownloadStore } from "@next-boilerplate/scripts/utils/template-config/stores.js"

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
    await handleDownloadStore(store, {
      override: true,
      assetsDirectory,
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
      plugins: configuration.plugins?.filter((p) => p.name !== store.name),
      stores: configuration.stores?.filter((s) => s.name !== store.name),
    })

    // Delete form store folder
    await handleDeleteStore(store, assetsDirectory)

    const data: z.infer<ReturnType<typeof deleteStoreResponseSchema>> = { success: true }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
