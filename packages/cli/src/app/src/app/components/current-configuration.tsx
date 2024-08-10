import { useRef, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Eye, MoreHorizontal, Pencil } from "lucide-react"
import { v4 as uuid } from "uuid"
import { z } from "zod"

import { updateConfigurationRequestSchema } from "@/api/configuration/schemas"
import { Icons } from "@/components/icons"
import Header from "@/components/ui/header"
import ItemCard from "@/components/ui/item-card"
import Section from "@/components/ui/section"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Button } from "@nextui-org/button"
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown"
import { Spinner } from "@nextui-org/spinner"

import { CurrentConfigurationDr } from "./current-configuration.dr"
import NoConfiguration from "./no-configuration"

type TPlugin = NonNullable<RouterOutputs["configuration"]["getConfiguration"]["configuration"]["plugins"]>[number]

export default function CurrentConfiguration({
  dictionary,
  ssrConfiguration,
}: {
  dictionary: TDictionary<typeof CurrentConfigurationDr>
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
}) {
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  const utils = trpc.useUtils()
  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation()
  const resetConfigurationMutation = trpc.configuration.resetConfiguration.useMutation()

  const [isPending, setIsPending] = useState(false)
  const updateConfiguration = async (data: z.infer<ReturnType<typeof updateConfigurationRequestSchema>>) => {
    setIsPending(true)
    try {
      await updateConfigurationMutation.mutateAsync(data)
      await utils.configuration.invalidate()
    } finally {
      setIsPending(false)
    }
  }

  const resetConfiguration = async () => {
    setIsPending(true)
    try {
      await resetConfigurationMutation.mutateAsync()
      await utils.configuration.invalidate()
    } finally {
      setIsPending(false)
    }
  }

  const bubblesDuration = 0.45
  const animateBubbles = (boundingBox: DOMRect) => {
    //* Animate deletion
    const bubbles = 100
    const minSize = 5
    const maxSize = 15
    const startXRadius = 320
    const startYRadius = 20
    const endXRadius = 350
    const endYRadius = 40
    const xRandomness = 50
    const yRandomness = 20
    const angleStep = (2 * Math.PI) / bubbles
    const center = {
      x: boundingBox.x + boundingBox.width / 2,
      y: boundingBox.y + boundingBox.height / 2,
    }
    const newBubbles = Array.from({ length: bubbles }, (_, i) => {
      const size = Math.random() * (maxSize - minSize) + minSize
      const angle = angleStep * i
      const cosAngle = Math.cos(angle)
      const sinAngle = Math.sin(angle)
      const xRandomnessValue = (Math.random() - 0.5) * xRandomness * 2
      const yRandomnessValue = (Math.random() - 0.5) * yRandomness * 2
      return {
        key: uuid(),
        position: {
          x: center.x + startXRadius * cosAngle + xRandomnessValue * cosAngle,
          y: center.y + startYRadius * sinAngle + yRandomnessValue * sinAngle,
        },
        destination: {
          x: center.x + endXRadius * cosAngle + xRandomnessValue,
          y: center.y + endYRadius * sinAngle + yRandomnessValue,
        },
        size,
      }
    })
    setDeletionBubbles((prev) => [...prev, ...newBubbles])
    setTimeout(
      () => {
        setDeletionBubbles((prev) => prev.filter((bubble) => !newBubbles.includes(bubble)))
      },
      bubblesDuration * 1000 + 3000
    )
  }

  const [deletionBubbles, setDeletionBubbles] = useState<
    {
      key: string
      position: { x: number; y: number }
      destination: { x: number; y: number }
      size: number
    }[]
  >([])
  const onDelete = (plugin: TPlugin) => async (boundingBox: DOMRect) => {
    const plugins = configuration.data.configuration.plugins?.filter((p) => p.name !== plugin.name)
    await updateConfiguration({
      configuration: {
        plugins,
      },
    })

    animateBubbles(boundingBox)
  }

  /**
   * Use to debug particles
   */
  // useEffect(() => {
  //   const debug = () => {
  //     const firstPlugin = configuration.data.configuration.plugins?.[0]
  //     if (!firstPlugin) return
  //     const boundingBox = document.querySelector("li.plugin")?.getBoundingClientRect()
  //     if (!boundingBox) return
  //     animateBubbles(boundingBox)
  //   }
  //   document.addEventListener("click", debug)
  //   return () => {
  //     document.removeEventListener("click", debug)
  //   }
  // }, [configuration.data.configuration.plugins])

  const hasEmptyConfiguration =
    !configuration.data.configuration.plugins || configuration.data.configuration.plugins.length === 0
  if (hasEmptyConfiguration) {
    return <NoConfiguration dictionary={dictionary} />
  }

  return (
    <Section>
      <Header
        title={dictionary.configuration}
        actions={
          <Button color="danger" variant="light" onClick={resetConfiguration} isLoading={isPending}>
            {dictionary.reset}
          </Button>
        }
        dictionary={dictionary}
      />
      <ul className="relative z-10 flex flex-1 flex-col gap-2 overflow-auto scrollbar-hide">
        <AnimatePresence>
          {configuration.data.configuration.plugins?.map((plugin) => (
            <Plugin
              key={plugin.name}
              plugin={plugin}
              dictionary={dictionary}
              isPending={isPending}
              onDelete={onDelete(plugin)}
            />
          ))}
        </AnimatePresence>
      </ul>
      {deletionBubbles.map((bubble) => (
        <motion.div
          key={bubble.key}
          layout
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            top: 0,
            left: 0,
          }}
          transition={{ duration: bubblesDuration }}
          initial={{ x: bubble.position.x, y: bubble.position.y, scale: 1, opacity: 1 }}
          animate={{ x: bubble.destination.x, y: bubble.destination.y, opacity: 0, scale: 0.5 }}
          className="absolute rounded-full bg-foreground"
        />
      ))}
    </Section>
  )
}

function Plugin({
  plugin,
  dictionary,
  onDelete: _onDelete,
  isPending,
}: {
  plugin: TPlugin
  dictionary: TDictionary<typeof CurrentConfigurationDr>
  onDelete: (boundingBox: DOMRect) => Promise<void>
  isPending: boolean
}) {
  const liRef = useRef<HTMLLIElement>(null)

  const onDelete = async () => {
    const li = liRef.current
    if (!li) return
    const boundingBox = li.getBoundingClientRect()

    //* Delete from server
    await _onDelete(boundingBox)
  }

  const outputPath = plugin.outputPath ?? plugin.suggestedPath

  return (
    <ItemCard
      id={plugin.name}
      liRef={liRef}
      title={plugin.name}
      subTitle={
        <>
          {plugin.sourcePath}
          <ArrowRight className="size-2.5" />
          {outputPath}
        </>
      }
      description={plugin.description}
      actions={
        <>
          <Button color="primary" variant="flat" className="h-max min-w-0 p-2.5">
            <Eye className="size-5" />
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button color="default" className="h-max min-w-0 p-2.5">
                <MoreHorizontal className="size-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Actions" disabledKeys={isPending ? ["edit", "delete"] : []}>
              <DropdownItem
                key="edit"
                startContent={
                  isPending ? (
                    <Spinner
                      classNames={{
                        wrapper: "!size-4",
                      }}
                      color="current"
                      size="sm"
                    />
                  ) : (
                    <Pencil className="pointer-events-none size-4 shrink-0" />
                  )
                }
              >
                {dictionary.edit}
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={
                  isPending ? (
                    <Spinner
                      classNames={{
                        wrapper: "!size-4",
                      }}
                      color="current"
                      size="sm"
                    />
                  ) : (
                    <Icons.trash className="pointer-events-none size-4 shrink-0" />
                  )
                }
                onClick={onDelete}
              >
                {dictionary.delete}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </>
      }
    />
  )
}
