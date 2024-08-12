import { useEffect, useState } from "react"

import { Locale } from "@/lib/i18n-config"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Spinner } from "@nextui-org/spinner"

import { ThemeSwitch } from "./theme/theme-switch"
import LocaleSwitcher from "./locale-switcher"
import { NavSettingsDr } from "./nav-settings.dr"

export default function NavSettings({
  lang,
  ssrConfiguration,
  dictionary,
}: {
  lang: Locale
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  dictionary: TDictionary<typeof NavSettingsDr>
}) {
  const utils = trpc.useUtils()
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  const [newName, setNewName] = useState(configuration.data.configuration.name)
  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation()

  const [isPending, setIsPending] = useState(false)
  const updateConfiguration = async () => {
    setIsPending(true)
    try {
      await updateConfigurationMutation.mutateAsync({
        configuration: {
          name: newName,
        },
      })
      await utils.configuration.invalidate()
    } finally {
      setIsPending(false)
    }
  }

  // Debounce the update
  useEffect(() => {
    if (!newName || newName === configuration.data.configuration.name) return
    const timeout = setTimeout(() => {
      updateConfiguration()
    }, 250)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newName, configuration.data.configuration.name])

  return (
    <aside className="flex flex-row justify-between rounded-medium bg-content1 px-3 py-2">
      <div className="flex flex-col gap-1">
        <label className="cursor-pointer text-xs uppercase text-muted-foreground" htmlFor="project-name">
          {dictionary.projectName}
        </label>
        <div className="relative">
          <input
            className="border-none bg-transparent text-base font-semibold focus-visible:outline-none"
            value={newName ?? ""}
            id="project-name"
            onChange={(e) => setNewName(e.target.value)}
          />
          {isPending && (
            <Spinner
              size="sm"
              classNames={{
                wrapper: "!size-4",
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              color="current"
            />
          )}
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <ThemeSwitch />
        <LocaleSwitcher lang={lang} />
      </div>
    </aside>
  )
}
