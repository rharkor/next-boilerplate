import { presignedUrlResponseSchema, presignedUrlSchema } from "@/lib/schemas/upload"
import { authenticatedProcedure, router } from "@/lib/server/trpc"

import { presignedUrl } from "./mutations"

export const uploadRouter = router({
  presignedUrl: authenticatedProcedure
    .input(presignedUrlSchema())
    .output(presignedUrlResponseSchema())
    .mutation(presignedUrl),
})
