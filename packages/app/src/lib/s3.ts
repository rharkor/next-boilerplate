import { env } from "env.mjs"

import { S3Client } from "@aws-sdk/client-s3"

export const s3Client = env.ENABLE_S3_SERVICE
  ? new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? "",
      },
      endpoint: env.NEXT_PUBLIC_AWS_ENDPOINT,
    })
  : null
