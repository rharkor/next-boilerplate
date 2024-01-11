import { Locale } from "i18n-config"

import { ThemeSwitch } from "./theme/theme-switch"
import LocaleSwitcher from "./locale-switcher"

export default function NavSettings({ lang }: { lang: Locale }) {
  return (
    <div className="fixed right-3 top-3 z-10 flex flex-row gap-3">
      <ThemeSwitch />
      <LocaleSwitcher lang={lang} />
    </div>
  )
}
