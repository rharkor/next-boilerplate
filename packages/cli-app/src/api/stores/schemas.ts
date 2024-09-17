import { z } from "zod"

import { storeConfigSchema } from "@next-boilerplate/scripts/utils/template-config/index.js"
import { fullStoreSchema } from "@next-boilerplate/scripts/utils/template-config/stores.js"

export const getStoresResponseSchema = () => z.object({ stores: z.array(fullStoreSchema) })

export const installOrUpdateStoreRequestSchema = () =>
  z.object({
    store: storeConfigSchema,
  })

export const installOrUpdateStoreResponseSchema = () => z.object({ success: z.boolean() })

export const deleteStoreRequestSchema = () =>
  z.object({
    store: storeConfigSchema,
  })

export const deleteStoreResponseSchema = () => z.object({ success: z.boolean() })
