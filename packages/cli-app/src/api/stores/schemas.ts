import { z } from "zod"

import { fullStoreSchema } from "@/lib/stores"
import { storeConfigSchema } from "@next-boilerplate/scripts/utils/template-config/index.js"

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
