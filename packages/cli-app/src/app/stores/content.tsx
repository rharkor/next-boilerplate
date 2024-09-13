"use client"

import { useState } from "react"

import { Plus } from "lucide-react"

import Header from "@/components/ui/header"
import ItemCard from "@/components/ui/item-card"
import { ModalHeader } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { gitRemoteToName } from "@/lib/utils/client-utils"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Modal, ModalBody, ModalContent, ModalFooter } from "@nextui-org/modal"

import { StoresContentDr } from "./content.dr"

export default function StoresContent({
  ssrConfiguration,
  dictionary,
}: {
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  dictionary: TDictionary<typeof StoresContentDr>
}) {
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false)
  const [newStoreName, setNewStoreName] = useState("")

  const utils = trpc.useUtils()
  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation({
    onSuccess: async () => {
      await utils.configuration.invalidate()
    },
  })
  const onAddStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStoreName) return
    await updateConfigurationMutation.mutateAsync({
      configuration: {
        ...configuration.data.configuration,
        stores: Array.from(new Set([...(configuration.data.configuration.stores ?? []), newStoreName])),
      },
    })
    setIsAddStoreOpen(false)
    setNewStoreName("")
  }

  const isPending = updateConfigurationMutation.isPending

  return (
    <>
      <Header
        title={dictionary.stores}
        dictionary={dictionary}
        actions={
          <Button color="primary" onPress={() => setIsAddStoreOpen(true)} isLoading={isPending}>
            <Plus className="size-4 shrink-0" />
            {dictionary.addStore}
          </Button>
        }
      />
      <ul className="flex flex-1 flex-col gap-2">
        {(configuration.data.configuration.stores ?? []).map((storeRemote) => (
          <ItemCard key={storeRemote} id={storeRemote} title={gitRemoteToName(storeRemote)} description={storeRemote} />
        ))}
      </ul>
      <Modal isOpen={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{dictionary.addStore}</ModalHeader>
              <form onSubmit={onAddStore}>
                <ModalBody>
                  <Input
                    label={dictionary.storeRemote}
                    value={newStoreName}
                    onValueChange={setNewStoreName}
                    placeholder={dictionary.storeRemoteExample}
                  />
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
