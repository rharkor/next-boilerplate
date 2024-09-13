import { z } from "zod"

import { storeConfigSchema } from "@next-boilerplate/scripts/utils/template-config"

export const fullStoreSchema = storeConfigSchema.extend({
  fullPath: z.string(),
})

export type TStoreStore = z.infer<typeof fullStoreSchema>
let stores: TStoreStore[] | null = null

export const getStoresFromStore = async () => {
  return stores
}

export const setStoresToStore = async (newStores: TStoreStore[]) => {
  stores = newStores
}

export const resetStoresStore = async () => {
  stores = null
}
