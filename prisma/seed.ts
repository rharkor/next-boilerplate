import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const load = async () => {
  try {
    await prisma.user.create({
      data: {
        email: "louis@huort.com",
        name: "HUORT Louis",
        image: "https://avatars.githubusercontent.com/u/70844594?v=4",
        emailVerified: null,
      },
    })
    console.log("User created")
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}
load()
