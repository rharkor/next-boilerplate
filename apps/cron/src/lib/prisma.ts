import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

// eslint-disable-next-line no-process-env
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
