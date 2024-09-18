import { z } from "zod"

import { fullStoreSchema, storeConfigSchema } from "@next-boilerplate/cli-helpers/stores"

export const getStoresRequestSchema = () =>
  z.object({
    search: z.string().optional(),
    onlyInstalled: z.boolean().optional(),
  })

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
