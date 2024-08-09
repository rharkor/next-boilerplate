import { useRef, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { Eye, MoreHorizontal, Pencil } from "lucide-react"
import { v4 as uuid } from "uuid"
import { z } from "zod"

import { updateConfigurationRequestSchema } from "@/api/configuration/schemas"
import { Icons } from "@/components/icons"
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
    const xRandomness = 150
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

  const hasEmptyConfiguration =
    !configuration.data.configuration.plugins || configuration.data.configuration.plugins.length === 0
  if (hasEmptyConfiguration) {
    return <NoConfiguration dictionary={dictionary} />
  }

  return (
    <section className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl">{dictionary.configuration}</h1>
        <Button color="danger" variant="light" onClick={resetConfiguration} isLoading={isPending}>
          {dictionary.reset}
        </Button>
      </div>
      {configuration.data.configuration.plugins ? (
        <ul className="relative z-10 flex flex-col gap-2 overflow-auto scrollbar-hide">
          <AnimatePresence>
            {configuration.data.configuration.plugins.map((plugin) => (
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
      ) : (
        <p>No plugin</p>
      )}

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
    </section>
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

  return (
    <motion.li
      layout
      key={plugin.name}
      className="flex cursor-pointer flex-col gap-2 rounded-medium bg-content2 p-3 shadow hover:bg-content2/80"
      exit={{ opacity: 0, scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      ref={liRef}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xl font-medium">{plugin.name}</p>
          <p className="text-xs text-muted-foreground">{plugin.path ?? plugin.config.suggestedPath}</p>
        </div>
        <div className="flex flex-row gap-2">
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
        </div>
      </div>
      <p className="truncate text-sm">{plugin.config.description}</p>
    </motion.li>
  )
}
