import { Locale } from "i18n-config"

import requireAuth from "@/components/auth/require-auth"
import NavSettings from "@/components/nav-settings"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"

export default async function ProtectedLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: {
    lang: Locale
  }
}) {
  const session = await requireAuth()

  //* Set last locale
  // Get last locale from redis or db
  const getLastLocale = async () => {
    const lastLocale = await redis.get(`lastLocale:${session.user.id}`)
    if (lastLocale) {
      return lastLocale
    }
    const lastLocaleFromDb = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastLocale: true },
    })
    if (lastLocaleFromDb && lastLocaleFromDb.lastLocale) {
      await redis.set(`lastLocale:${session.user.id}`, lastLocaleFromDb.lastLocale)
      return lastLocaleFromDb.lastLocale
    }
    return null
  }
  // Set last locale in redis and db
  const setLastLocale = async (locale: Locale) => {
    await redis.set(`lastLocale:${session.user.id}`, locale)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastLocale: locale },
    })
  }

  const lastLocale = await getLastLocale()
  if (lastLocale !== lang) {
    await setLastLocale(lang)
  }

  return (
    <>
      {children}
      <NavSettings lang={lang} />
    </>
  )
}
