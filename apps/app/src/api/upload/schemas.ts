import { z } from "zod"

export const presignedUrlSchema = () =>
  z.object({
    filename: z.string(),
    filetype: z.string(),
  })

export const presignedUrlResponseSchema = () =>
  z.object({
    url: z.string(),
    fields: z.record(z.string()),
  })
