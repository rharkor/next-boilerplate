import { z } from "zod"

import { getStores } from "@/lib/stores"
import { handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"

import { getStoresResponseSchema } from "./schemas"

export const getStoresQuery = async ({}: apiInputFromSchema<typeof undefined>) => {
  try {
    const stores = await getStores()

    const data: z.infer<ReturnType<typeof getStoresResponseSchema>> = { stores }
    return data
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
