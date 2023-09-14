import requireAuth from "@/components/auth/require-auth"
import LocaleSwitcher from "@/components/locale-switcher"
import { ThemeSwitch } from "@/components/theme/theme-switch"
import { Locale } from "i18n-config"

export default async function ProtectedLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: {
    lang: Locale
  }
}) {
  await requireAuth()

  return (
    <>
      {children}
      <div className="fixed right-2 top-2 z-10 flex flex-row space-x-2">
        <LocaleSwitcher lang={lang} />
        <ThemeSwitch />
      </div>
    </>
  )
}
