import { Fragment, useRef, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowDownToLine, Eye, MoreHorizontal, Pencil } from "lucide-react"
import { toast } from "react-toastify"
import { v4 as uuid } from "uuid"
import { z } from "zod"

import { updateConfigurationRequestSchema } from "@/api/configuration/schemas"
import { Icons } from "@/components/icons"
import Header from "@/components/ui/header"
import ItemCard from "@/components/ui/item-card"
import { ModalHeader } from "@/components/ui/modal"
import Section from "@/components/ui/section"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Button } from "@nextui-org/button"
import { Divider } from "@nextui-org/divider"
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown"
import { Input } from "@nextui-org/input"
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from "@nextui-org/modal"
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
  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation({
    onSuccess: async () => {
      await utils.configuration.invalidate()
    },
  })
  const resetConfigurationMutation = trpc.configuration.resetConfiguration.useMutation({
    onSuccess: async () => {
      await utils.configuration.invalidate()
    },
  })

  const updateConfiguration = async (data: z.infer<ReturnType<typeof updateConfigurationRequestSchema>>) => {
    await updateConfigurationMutation.mutateAsync(data)
  }

  const resetConfiguration = async () => {
    await resetConfigurationMutation.mutateAsync()
  }

  const applyConfigurationMutation = trpc.configuration.applyConfiguration.useMutation({
    onSuccess: async () => {
      toast.success(dictionary.configurationApplied)
    },
  })

  const applyConfiguration = async () => {
    await applyConfigurationMutation.mutateAsync()
  }

  const isPending =
    updateConfigurationMutation.isPending ||
    resetConfigurationMutation.isPending ||
    applyConfigurationMutation.isPending

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

  const [search, setSearch] = useState("")

  const hasEmptyConfiguration =
    !configuration.data.configuration.plugins || configuration.data.configuration.plugins.length === 0
  if (hasEmptyConfiguration) {
    return <NoConfiguration dictionary={dictionary} />
  }

  const onEdit = async (plugin: TPlugin) => {
    await updateConfiguration({
      configuration: {
        plugins: configuration.data.configuration.plugins?.map((p) => {
          if (p.id === plugin.id) {
            return plugin
          }
          return p
        }),
      },
    })
  }

  const plugins =
    configuration.data.configuration.plugins?.filter((plugin) => {
      return plugin.name.toLowerCase().includes(search.toLowerCase())
    }) ?? []

  return (
    <Section>
      <Header
        title={dictionary.configuration}
        actions={
          <>
            <Input value={search} onValueChange={setSearch} placeholder={dictionary.search} />
            <Button color="danger" variant="light" onPress={resetConfiguration} isLoading={isPending}>
              {dictionary.reset}
            </Button>
            <Button color="primary" onPress={applyConfiguration} isLoading={isPending}>
              <ArrowDownToLine className="size-4 shrink-0" />
              {dictionary.apply}
            </Button>
          </>
        }
        dictionary={dictionary}
      />
      <ul className="relative z-10 flex flex-1 flex-col gap-2">
        <AnimatePresence>
          {plugins.map((plugin) => (
            <Plugin
              key={plugin.id}
              plugin={plugin}
              dictionary={dictionary}
              isPending={isPending}
              onDelete={onDelete(plugin)}
              onEdit={onEdit}
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
  onEdit: _onEdit,
  isPending,
}: {
  plugin: TPlugin
  dictionary: TDictionary<typeof CurrentConfigurationDr>
  onDelete: (boundingBox: DOMRect) => Promise<void>
  onEdit: (plugin: TPlugin) => Promise<void>
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

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
    onClose: onEditClose,
  } = useDisclosure()

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await _onEdit(plugin)
    onEditClose()
  }

  const [overridedTo, setOverridedTo] = useState<Record<string, string>>(
    plugin.paths.reduce(
      (acc, p) => {
        acc[p.from] = p.overridedTo ?? p.to
        return acc
      },
      {} as Record<string, string>
    )
  )
  const editPath = (fromKey: string) => (to: string) => {
    setOverridedTo((prev) => ({
      ...prev,
      [fromKey]: to,
    }))
    plugin.paths = plugin.paths.map((p) => {
      if (p.from === fromKey) {
        return {
          ...p,
          overridedTo: to,
        }
      }
      return p
    })
  }

  return (
    <>
      <ItemCard
        id={plugin.id}
        liRef={liRef}
        title={plugin.name}
        subTitle={plugin.sourcePath}
        description={plugin.description}
        href={`/plugins/${encodeURIComponent(plugin.id)}`}
        actions={
          <>
            <Button color="primary" variant="flat" className="h-max min-w-0 p-2.5">
              <Eye className="size-5" />
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  color="default"
                  className="h-max min-w-0 p-2.5"
                  onClick={(e) => {
                    e.preventDefault()
                  }}
                >
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
                  onClick={(e) => {
                    e.preventDefault()
                    onEditOpen()
                  }}
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
                  onClick={(e) => {
                    e.preventDefault()
                    onDelete()
                  }}
                >
                  {dictionary.delete}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </>
        }
      />
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{dictionary.pluginSettings}</ModalHeader>
              <form onSubmit={onEdit}>
                <ModalBody>
                  {plugin.paths.map((p, i) => (
                    <Fragment key={p.from}>
                      {i !== 0 && <Divider orientation="horizontal" />}
                      <div className="flex flex-col gap-1">
                        <Input isDisabled isReadOnly value={p.from} label={dictionary.sourcePath} />
                        <Input
                          value={overridedTo[p.from] ?? ""}
                          onValueChange={editPath(p.from)}
                          placeholder={p.to}
                          label={dictionary.outputPath}
                        />
                      </div>
                    </Fragment>
                  ))}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose} isDisabled={isPending}>
                    {dictionary.close}
                  </Button>
                  <Button color="primary" type="submit" isLoading={isPending}>
                    {dictionary.save}
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
