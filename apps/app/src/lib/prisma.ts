import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
  }).$extends({
    query: {
      user: {
        async $allOperations({ args, query }) {
          const result = await query(args)
          if (
            !("select" in args) ||
            (args.select &&
              typeof args.select === "object" &&
              "password" in args.select &&
              args.select.password !== true)
          ) {
            if (Array.isArray(result)) result.forEach((r) => "password" in r && delete r.password)
            else typeof result === "object" && result && "password" in result && delete result.password
          }
          return result
        },
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
