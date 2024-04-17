import { randomUUID } from "crypto"
import { z } from "zod"

import { maxUploadSize } from "@/constants"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { s3Client } from "@/lib/s3"
import { stringToSlug } from "@/lib/utils"
import { ApiError, ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { logger } from "@next-boilerplate/lib"

import { presignedUrlResponseSchema, presignedUrlSchema } from "./schemas"

export const presignedUrl = async ({ input, ctx: { session } }: apiInputFromSchema<typeof presignedUrlSchema>) => {
  ensureLoggedIn(session)
  try {
    if (!env.ENABLE_S3_SERVICE || !s3Client) {
      return ApiError("s3ServiceDisabled")
    }

    const { filename, filetype } = input
    //? Slug and max length
    const filenameFormatted = stringToSlug(filename).slice(0, 50)
    const Key = randomUUID() + "-" + filenameFormatted
    const expiresInSeconds = 600 //? 10 minutes
    const expires = new Date(Date.now() + expiresInSeconds * 1000)
    const bucket = env.NEXT_PUBLIC_S3_BUCKET_NAME
    const endpoint = env.NEXT_PUBLIC_S3_ENDPOINT
    if (!endpoint || !bucket) {
      logger.error("S3 endpoint or bucket is not defined")
      return ApiError("s3ServiceDisabled")
    }

    await prisma.fileUploading.create({
      data: {
        key: Key,
        user: {
          connect: {
            id: session.user.id,
          },
        },
        expires,
        bucket,
        endpoint,
        filetype,
      },
    })
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucket,
      Key,
      Conditions: [
        ["content-length-range", 0, maxUploadSize], // up to 10 MB
        ["starts-with", "$Content-Type", filetype],
      ],
      Fields: {
        acl: "public-read",
        "Content-Type": filetype,
      },
      Expires: expiresInSeconds, //? Seconds before the presigned post expires. 3600 by default.
    })

    const response: z.infer<ReturnType<typeof presignedUrlResponseSchema>> = {
      url,
      fields,
    }
    return response
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
