"use client"

import { useCallback, useMemo } from "react"

import { PackageMinus, PackagePlus, ToyBrick } from "lucide-react"

import ItemCard from "@/components/ui/item-card"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { getItemUID, getStoreUID } from "@next-boilerplate/cli-helpers/stores"
import { Button } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner"
import { Tooltip } from "@nextui-org/tooltip"

import { PluginsContentDr } from "./content.dr"

type TPlugins = RouterOutputs["plugins"]["getPlugins"]
type TPlugin = TPlugins["plugins"][number]

export default function Plugin({
  plugin,
  ssrConfiguration,
  dictionary,
  isLoading,
}: {
  plugin: TPlugin
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  dictionary: TDictionary<typeof PluginsContentDr>
  isLoading?: boolean
}) {
  const utils = trpc.useUtils()

  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  const isPluginInConfiguration = useMemo(() => {
    return configuration.data.configuration.plugins?.some(
      (_plugin) => _plugin.name === plugin.name && getStoreUID(_plugin.store) === getStoreUID(plugin.store)
    )
  }, [configuration.data.configuration.plugins, plugin])

  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation({
    onSuccess: async () => {
      await utils.configuration.invalidate()
    },
  })

  const addToConfiguration = useCallback(async () => {
    await updateConfigurationMutation.mutateAsync({
      configuration: {
        ...configuration.data.configuration,
        plugins: [...(configuration.data.configuration.plugins || []), plugin],
      },
    })
  }, [configuration.data.configuration, plugin, updateConfigurationMutation])

  const removeFromConfiguration = useCallback(async () => {
    await updateConfigurationMutation.mutateAsync({
      configuration: {
        ...configuration.data.configuration,
        plugins: configuration.data.configuration.plugins?.filter(
          (_plugin) =>
            _plugin.name !== plugin.name &&
            _plugin.store.name !== plugin.store.name &&
            _plugin.store.version !== plugin.store.version
        ),
      },
    })
  }, [configuration.data.configuration, plugin, updateConfigurationMutation])

  const togglePlugin = useCallback(async () => {
    if (isPluginInConfiguration) {
      await removeFromConfiguration()
    } else {
      await addToConfiguration()
    }
  }, [addToConfiguration, isPluginInConfiguration, removeFromConfiguration])

  return (
    <ItemCard
      key={getItemUID(plugin)}
      id={getItemUID(plugin)}
      title={plugin.name}
      subTitle={plugin.sourcePath}
      description={plugin.description}
      isLoading={isLoading}
      endContent={
        isLoading ? null : (
          <>
            <ToyBrick className="absolute right-2 top-2 size-4 text-primary" />
            <Tooltip
              content={isPluginInConfiguration ? dictionary.removeFromConfiguration : dictionary.addToConfiguration}
              delay={500}
            >
              <Button
                size="sm"
                color="primary"
                className="absolute bottom-2 right-2 h-max min-w-0 p-1"
                variant={isPluginInConfiguration ? "flat" : "shadow"}
                onClick={(e) => {
                  e.preventDefault()
                  togglePlugin()
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    togglePlugin()
                  }
                }}
              >
                {updateConfigurationMutation.isPending ? (
                  <Spinner
                    size="sm"
                    classNames={{
                      wrapper: "!size-5",
                    }}
                    color="current"
                  />
                ) : isPluginInConfiguration ? (
                  <PackageMinus className="size-5" />
                ) : (
                  <PackagePlus className="size-5" />
                )}
              </Button>
            </Tooltip>
          </>
        )
      }
      href={`/plugins/${encodeURIComponent(getItemUID(plugin))}`}
      className="pr-12"
    />
  )
}
