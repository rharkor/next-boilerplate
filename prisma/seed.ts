import { PrismaClient } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { hash as bhash } from "bcryptjs"
import crypto from "crypto-js"
import * as dotenv from "dotenv"

dotenv.config({
  path: ".env",
})

const env = {
  AUTH_ADMIN_EMAIL: process.env.AUTH_ADMIN_EMAIL,
  AUTH_ADMIN_PASSWORD: process.env.AUTH_ADMIN_PASSWORD,
  PASSWORD_HASHER_SECRET: process.env.PASSWORD_HASHER_SECRET,
}

const hash = async (value: string, saltOrRounds: string | number) => {
  const preHashed = crypto.HmacSHA256(value, env.PASSWORD_HASHER_SECRET ?? "").toString()
  return await bhash(preHashed, saltOrRounds)
}

if (!env.AUTH_ADMIN_EMAIL || !env.AUTH_ADMIN_PASSWORD || !env.PASSWORD_HASHER_SECRET) {
  console.error("Missing AUTH_ADMIN_EMAIL or AUTH_ADMIN_PASSWORD or PASSWORD_HASHER_SECRET")
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.user.create({
      data: {
        email: env.AUTH_ADMIN_EMAIL,
        password: await hash(env.AUTH_ADMIN_PASSWORD ?? "", 12),
        role: "admin",
      },
    })
    console.log("Admin created")
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        console.error("Admin already exists")
        process.exit(0)
      }
    }
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
