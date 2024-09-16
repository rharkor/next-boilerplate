import { publicProcedure, router } from "@/lib/trpc/init"

import { deleteStore, installOrUpdateStore } from "./mutations"
import { getStoresQuery } from "./queries"
import {
  deleteStoreRequestSchema,
  deleteStoreResponseSchema,
  getStoresResponseSchema,
  installOrUpdateStoreRequestSchema,
  installOrUpdateStoreResponseSchema,
} from "./schemas"

export const storesRouter = router({
  getStores: publicProcedure.output(getStoresResponseSchema()).query(getStoresQuery),
  installOrUpdateStore: publicProcedure
    .input(installOrUpdateStoreRequestSchema())
    .output(installOrUpdateStoreResponseSchema())
    .mutation(installOrUpdateStore),
  deleteStore: publicProcedure
    .input(deleteStoreRequestSchema())
    .output(deleteStoreResponseSchema())
    .mutation(deleteStore),
})
