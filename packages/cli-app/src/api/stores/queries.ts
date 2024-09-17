import { z } from "zod"

import { assetsDirectory } from "@/lib/configuration"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { getStores } from "@next-boilerplate/scripts/utils/template-config/stores.js"

import { getStoresResponseSchema } from "./schemas"

export const getStoresQuery = async ({}: apiInputFromSchema<typeof undefined>) => {
  try {
    const stores = await getStores({ assetsDirectory })

    const data: z.infer<ReturnType<typeof getStoresResponseSchema>> = { stores }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
