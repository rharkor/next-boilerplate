"use client"

import { useCallback, useState } from "react"

import { ArrowRight, PackageMinus, PackagePlus, ToyBrick } from "lucide-react"

import ItemCard from "@/components/ui/item-card"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Button } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner"
import { Tooltip } from "@nextui-org/tooltip"

import { PluginsContentDr } from "./content.dr"

export default function PluginsContent({
  ssrPlugins,
  ssrConfiguration,
  dictionary,
}: {
  ssrPlugins: RouterOutputs["plugins"]["getPlugins"]
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  dictionary: TDictionary<typeof PluginsContentDr>
}) {
  const utils = trpc.useUtils()

  const plugins = trpc.plugins.getPlugins.useQuery(
    {},
    {
      initialData: ssrPlugins,
    }
  )

  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  const isPluginInConfiguration = useCallback(
    (pluginSourcePath: string) => {
      return configuration.data.configuration.plugins?.some((plugin) => plugin.sourcePath === pluginSourcePath)
    },
    [configuration.data.configuration.plugins]
  )

  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation({
    onSuccess: async () => {
      await utils.configuration.invalidate()
    },
  })

  const [updatingPlugins, setUpdatingPlugins] = useState<{ [sourcePath: string]: boolean }>({})

  const addToConfiguration = useCallback(
    async (plugin: (typeof ssrPlugins)["plugins"][number]) => {
      setUpdatingPlugins((prev) => ({
        ...prev,
        [plugin.sourcePath]: true,
      }))
      try {
        await updateConfigurationMutation.mutateAsync({
          configuration: {
            ...configuration.data.configuration,
            plugins: [...(configuration.data.configuration.plugins || []), plugin],
          },
        })
      } finally {
        setUpdatingPlugins((prev) => {
          delete prev[plugin.sourcePath]
          return { ...prev }
        })
      }
    },
    [configuration.data.configuration, updateConfigurationMutation]
  )

  const removeFromConfiguration = useCallback(
    async (pluginSourcePath: string) => {
      setUpdatingPlugins((prev) => ({
        ...prev,
        [pluginSourcePath]: true,
      }))
      try {
        await updateConfigurationMutation.mutateAsync({
          configuration: {
            ...configuration.data.configuration,
            plugins: configuration.data.configuration.plugins?.filter(
              (plugin) => plugin.sourcePath !== pluginSourcePath
            ),
          },
        })
      } finally {
        setUpdatingPlugins((prev) => {
          delete prev[pluginSourcePath]
          return { ...prev }
        })
      }
    },
    [configuration.data.configuration, updateConfigurationMutation]
  )

  const togglePlugin = useCallback(
    async (plugin: (typeof ssrPlugins)["plugins"][number]) => {
      if (isPluginInConfiguration(plugin.sourcePath)) {
        await removeFromConfiguration(plugin.sourcePath)
      } else {
        await addToConfiguration(plugin)
      }
    },
    [addToConfiguration, isPluginInConfiguration, removeFromConfiguration]
  )

  const isPluginUpdating = useCallback(
    (plugin: (typeof ssrPlugins)["plugins"][number]) => {
      return updatingPlugins[plugin.sourcePath]
    },
    [updatingPlugins]
  )

  return (
    <ul className="relative z-10 flex flex-1 flex-col gap-2 overflow-auto scrollbar-hide">
      {plugins.data.plugins.map((plugin) => (
        <ItemCard
          key={plugin.sourcePath}
          id={plugin.sourcePath}
          title={plugin.name}
          subTitle={
            <>
              {plugin.sourcePath}
              <ArrowRight className="size-2.5" />
              {plugin.suggestedPath}
            </>
          }
          description={plugin.description}
          endContent={
            <>
              <ToyBrick className="absolute right-2 top-2 size-4 text-primary" />
              <Tooltip
                content={
                  isPluginInConfiguration(plugin.sourcePath)
                    ? dictionary.removeFromConfiguration
                    : dictionary.addToConfiguration
                }
                delay={300}
              >
                <Button
                  size="sm"
                  color="secondary"
                  className="absolute bottom-2 right-2 h-max min-w-0 p-1"
                  variant={isPluginInConfiguration(plugin.sourcePath) ? "flat" : "shadow"}
                  onClick={(e) => {
                    e.preventDefault()
                    togglePlugin(plugin)
                  }}
                >
                  {isPluginUpdating(plugin) ? (
                    <Spinner
                      size="sm"
                      classNames={{
                        wrapper: "!size-5",
                      }}
                      color="current"
                    />
                  ) : isPluginInConfiguration(plugin.sourcePath) ? (
                    <PackageMinus className="size-5" />
                  ) : (
                    <PackagePlus className="size-5" />
                  )}
                </Button>
              </Tooltip>
            </>
          }
          href={`/plugins/${encodeURIComponent(plugin.sourcePath)}`}
          className="pr-12"
        />
      ))}
    </ul>
  )
}
