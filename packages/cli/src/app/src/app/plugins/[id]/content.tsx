"use client"

import { useCallback, useMemo, useState } from "react"

import { PackageMinus, PackagePlus } from "lucide-react"

import Header from "@/components/ui/header"
import Section from "@/components/ui/section"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Button } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner"

import { PluginContentDr } from "./content.dr"

type TPlugin = RouterOutputs["plugins"]["getPlugin"]

export default function PluginContent({
  id,
  dictionary,
  ssrPlugin,
  ssrConfiguration,
}: {
  id: string
  dictionary: TDictionary<typeof PluginContentDr>
  ssrPlugin: TPlugin
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
}) {
  const utils = trpc.useUtils()

  const plugin = trpc.plugins.getPlugin.useQuery(
    {
      id,
    },
    {
      initialData: ssrPlugin,
    }
  )
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  const isInstalled = useMemo(() => {
    return configuration.data.configuration.plugins?.some((p) => p.id === plugin.data.plugin.id)
  }, [configuration.data, plugin.data])

  const [isPluginUpdating, setIsPluginUpdating] = useState(false)

  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation({
    onSuccess: async () => {
      await utils.configuration.invalidate()
    },
  })

  const addToConfiguration = useCallback(async () => {
    setIsPluginUpdating(true)
    try {
      await updateConfigurationMutation.mutateAsync({
        configuration: {
          ...configuration.data.configuration,
          plugins: [...(configuration.data.configuration.plugins || []), plugin.data.plugin],
        },
      })
    } finally {
      setIsPluginUpdating(false)
    }
  }, [configuration.data.configuration, plugin.data.plugin, updateConfigurationMutation])

  const removeFromConfiguration = useCallback(async () => {
    setIsPluginUpdating(true)
    try {
      await updateConfigurationMutation.mutateAsync({
        configuration: {
          ...configuration.data.configuration,
          plugins: configuration.data.configuration.plugins?.filter((plugin) => plugin.id !== plugin.id),
        },
      })
    } finally {
      setIsPluginUpdating(false)
    }
  }, [configuration.data.configuration, updateConfigurationMutation])

  const togglePlugin = useCallback(async () => {
    if (isInstalled) {
      await removeFromConfiguration()
    } else {
      await addToConfiguration()
    }
  }, [addToConfiguration, isInstalled, removeFromConfiguration])

  return (
    <Section>
      <Header title={plugin.data.plugin.name} withBack dictionary={dictionary} />
      <p>{plugin.data.plugin.description}</p>
      <div className="ml-auto">
        <Button
          color="primary"
          className="h-max min-w-0 p-2"
          variant={isInstalled ? "flat" : "shadow"}
          onClick={(e) => {
            e.preventDefault()
            togglePlugin()
          }}
        >
          {isPluginUpdating ? (
            <Spinner
              size="sm"
              classNames={{
                wrapper: "!size-6",
              }}
              color="current"
            />
          ) : isInstalled ? (
            <PackageMinus className="size-6" />
          ) : (
            <PackagePlus className="size-6" />
          )}
          <p>{isInstalled ? dictionary.removeFromConfiguration : dictionary.addToConfiguration}</p>
        </Button>
      </div>
    </Section>
  )
}
