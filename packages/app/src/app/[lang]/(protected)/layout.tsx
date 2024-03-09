import requireAuth from "@/components/auth/require-auth"
import NavSettings from "@/components/nav-settings"
import { lastLocaleExpirationInSeconds } from "@/constants"
import { Locale } from "@/lib/i18n-config"
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
      await redis.setex(`lastLocale:${session.user.id}`, lastLocaleExpirationInSeconds, lastLocaleFromDb.lastLocale)
      return lastLocaleFromDb.lastLocale
    }
    return null
  }
  // Set last locale in redis and db
  const setLastLocale = async (locale: Locale) => {
    await redis.setex(`lastLocale:${session.user.id}`, lastLocaleExpirationInSeconds, locale)
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
