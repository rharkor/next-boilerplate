import { env } from "env.mjs"

import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { s3Client } from "@/lib/s3"
import { updateUserSchema } from "@/lib/schemas/user"
import { ApiError, throwableErrorsMessages } from "@/lib/utils/server-utils"
import { ensureLoggedIn, handleApiError } from "@/lib/utils/server-utils"
import { apiInputFromSchema } from "@/types"
import { rolesAsObject } from "@/types/constants"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { Prisma } from "@prisma/client"

export const updateUser = async ({ input, ctx: { session } }: apiInputFromSchema<typeof updateUserSchema>) => {
  ensureLoggedIn(session)
  try {
    const { username, image } = input

    //* If the user has an image and the image is not the same as the new one, delete the old one (s3)
    if (image !== undefined && session.user.image && session.user.image !== image && s3Client) {
      const command = new DeleteObjectCommand({
        Bucket: env.NEXT_PUBLIC_AWS_BUCKET_NAME,
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

    //* Update the user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username,
        image,
      },
    })

    return { user }
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const meta = error.meta
        if ((meta?.target as Array<string>).includes("username")) {
          return ApiError(throwableErrorsMessages.username.exist)
        }
      }
    }
    return handleApiError(error)
  }
}

export const deleteAccount = async ({ ctx: { session } }: apiInputFromSchema<undefined>) => {
  try {
    ensureLoggedIn(session)
    //* Ensure not admin
    if (session.user.role === rolesAsObject.admin) {
      return ApiError(throwableErrorsMessages.cannotDeleteAdmin, "FORBIDDEN")
    }

    //* Delete the user
    const user = await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    })

    return { user }
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
