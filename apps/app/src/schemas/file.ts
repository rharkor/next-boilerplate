import { z } from "zod"

export const fileSchemaMinimal = () =>
  z.object({
    id: z.string(),
    bucket: z.string(),
    endpoint: z.string(),
    key: z.string(),
    filetype: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
