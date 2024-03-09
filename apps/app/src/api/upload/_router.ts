import { authenticatedProcedure, router } from "@/lib/server/trpc"

import { presignedUrl } from "./mutations"
import { presignedUrlResponseSchema, presignedUrlSchema } from "./schemas"

export const uploadRouter = router({
  presignedUrl: authenticatedProcedure
    .input(presignedUrlSchema())
    .output(presignedUrlResponseSchema())
    .mutation(presignedUrl),
})
