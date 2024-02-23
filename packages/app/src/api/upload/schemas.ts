import { z } from "zod"

export const presignedUrlSchema = () =>
  z.object({
    filename: z.string(),
    filetype: z.string(),
    kind: z.enum(["avatar"]),
  })

export const presignedUrlResponseSchema = () =>
  z.object({
    url: z.string(),
    fields: z.record(z.string()),
  })

export type TS3DeleteAsync = {
  key: string
  condition: string
  from: number
}
