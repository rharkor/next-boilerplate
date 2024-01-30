import { randomUUID } from "crypto"
import { env } from "env.mjs"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { s3Client } from "@/lib/s3"
import { presignedUrlResponseSchema, presignedUrlSchema } from "@/lib/schemas/upload"
import { stringToSlug } from "@/lib/utils"
import { ApiError, ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { maxUploadSize } from "@/types/constants"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { logger } from "@lib/logger"

export const presignedUrl = async ({ input, ctx: { session } }: apiInputFromSchema<typeof presignedUrlSchema>) => {
  ensureLoggedIn(session)
  try {
    if (!env.ENABLE_S3_SERVICE || !s3Client) {
      ApiError("s3ServiceDisabled")
    }

    const { filename, filetype, kind } = input
    //? Slug and max length
    const filenameFormatted = stringToSlug(filename).slice(0, 50)
    const Key = randomUUID() + "-" + filenameFormatted

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME ?? "",
      Key,
      Conditions: [
        ["content-length-range", 0, maxUploadSize], // up to 10 MB
        ["starts-with", "$Content-Type", filetype],
      ],
      Fields: {
        acl: "public-read",
        "Content-Type": filetype,
      },
      Expires: 600, //? Seconds before the presigned post expires. 3600 by default.
    })

    if (kind === "avatar") {
      //? Delete the old one
      if (session.user.image) {
        const command = new DeleteObjectCommand({
          Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME,
          Key: session.user.image,
        })
        await s3Client.send(command).catch((e) => {
          logger.error(e)
        })
        await prisma.user.update({
          where: {
            id: session.user.id,
          },
          data: {
            image: null,
          },
        })
      }
    }

    const response: z.infer<ReturnType<typeof presignedUrlResponseSchema>> = {
      url,
      fields,
    }
    return response
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
