import { z } from "zod"

import { assetsDirectory, getConfiguration } from "@/lib/configuration"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { getStoreUID } from "@next-boilerplate/cli-helpers/stores"
import { getStores } from "@next-boilerplate/cli-helpers/stores-helpers"

import { getStoresRequestSchema, getStoresResponseSchema } from "./schemas"

export const getStoresQuery = async ({
  input: { onlyInstalled },
}: apiInputFromSchema<typeof getStoresRequestSchema>) => {
  try {
    let stores = await getStores({ assetsDirectory })
    const configuration = await getConfiguration()

    // Filter to get stores that are already in the configuration
    if (onlyInstalled) {
      stores = stores.filter((store) => {
        const storeUID = store.uid
        const storeInConfiguration = configuration.stores?.find((s) => getStoreUID(s) === storeUID)
        return storeInConfiguration
      })
    }

    const data: z.infer<ReturnType<typeof getStoresResponseSchema>> = { stores }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
