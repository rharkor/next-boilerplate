import { exit } from "process"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { s3Client as _s3Client } from "@/lib/s3"
import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { chunk, logger } from "@next-boilerplate/lib"
import { Prisma } from "@prisma/client"

const clearUnusedUploads = async () => {
  const now = new Date()

  if (!env.ENABLE_S3_SERVICE || !_s3Client) {
    throw new Error("S3 service is disabled")
  }
  const s3Client = _s3Client

  //* Uploading files that are expired
  // Step 1: Find all uploading files that are expired
  const expiredUploadingFiles = await prisma.fileUploading.findMany({
    where: {
      expires: {
        lte: now,
      },
    },
    include: {
      file: true,
    },
  })
  if (!expiredUploadingFiles.length) {
    logger.debug(`No expired uploading files found`)
  } else {
    logger.info(`Found ${expiredUploadingFiles.length} expired uploading files`)
    const chuked = chunk(expiredUploadingFiles, 100)
    const deletedFiles: string[] = []

    await Promise.all(
      chuked.map(async (files) => {
        // Step 2: Delete the expired uploading files from S3
        const deleted: string[] = []
        deleted.push(...files.filter((file) => file.file).map((file) => file.id))
        await Promise.all(
          files
            // Only delete the files that are not linked to any item
            .filter((file) => !file.file)
            .map(async (file) => {
              const command = new DeleteObjectCommand({
                Bucket: file.bucket,
                Key: file.key,
              })
              const res = await s3Client.send(command).catch((e) => {
                logger.error(e)
                return null
              })
              if (res) {
                deleted.push(file.id)
              }
            })
        )
        // Step 3: Delete the expired uploading files from db
        await prisma.fileUploading.deleteMany({
          where: {
            id: {
              in: deleted,
            },
          },
        })
        deletedFiles.push(...deleted)
      })
    )
    logger.success(`Deleted ${deletedFiles.length} expired uploading files`)
  }

  //* Delete already uploaded files that are not linked to any item
  // Step 1: Find all uploaded files that are not linked to any item
  const allWhereFields = Prisma.FileScalarFieldEnum
  const baseProps = [
    "AND",
    "NOT",
    "OR",
    "id",
    "key",
    "bucket",
    "endpoint",
    "filetype",
    "fileUploadingId",
    "createdAt",
    "updatedAt",
  ] as const
  type TWhere = Prisma.FileWhereInput
  type TWhereFiltered = Omit<TWhere, (typeof baseProps)[number]>
  const whereInputs = Object.keys(allWhereFields).filter((field) => {
    return !baseProps.some((bp: (typeof baseProps)[number]) => bp === field)
  }) as (keyof Omit<TWhere, (typeof baseProps)[number]>)[]
  const where = whereInputs.reduce((acc, field) => {
    acc[field] = null
    return acc
  }, {} as TWhereFiltered)
  const unlikedFiles = await prisma.file.findMany({
    where,
  })
  if (!unlikedFiles.length) {
    logger.debug(`No unlinked files found`)
  } else {
    logger.info(`Found ${unlikedFiles.length} unlinked files`)
    const chuked = chunk(unlikedFiles, 100)
    const deletedFiles: string[] = []

    await Promise.all(
      chuked.map(async (files) => {
        // Step 2: Delete the unlinked files from S3
        const deleted: string[] = []
        await Promise.all(
          files.map(async (file) => {
            const command = new DeleteObjectCommand({
              Bucket: file.bucket,
              Key: file.key,
            })
            const res = await s3Client.send(command).catch((e) => {
              logger.error(e)
              return null
            })
            if (res) {
              deleted.push(file.key)
            }
          })
        )
        // Step 3: Delete the unlinked files from db
        await prisma.file.deleteMany({
          where: {
            id: {
              in: files.filter((file) => deleted.includes(file.key)).map((file) => file.id),
            },
          },
        })
        deletedFiles.push(...deleted)
      })
    )
    logger.success(`Deleted ${deletedFiles.length} unlinked files`)
  }
}

const main = async () => {
  const maxDurationWarning = 1000 * 60 * 5 // 5 minutes
  const name = "ClearUnusedUploads"
  const now = new Date()

  logger.prefix = () => `[${new Date().toLocaleString()}] `
  await clearUnusedUploads().catch((err) => {
    logger.error(
      `${name} started at ${now.toLocaleString()} and failed after ${new Date().getTime() - now.getTime()}ms`
    )
    throw err
  })
  const took = new Date().getTime() - now.getTime()
  if (took > maxDurationWarning) logger.warn(`${name} took ${took}ms`)

  exit(0)
}

main()
