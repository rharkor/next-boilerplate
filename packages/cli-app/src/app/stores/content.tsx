"use client"

import { useState } from "react"

import { Download, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { updateConfigurationRequestSchema } from "@/api/configuration/schemas"
import { Icons } from "@/components/icons"
import FormField from "@/components/ui/form"
import Header from "@/components/ui/header"
import ItemCard from "@/components/ui/item-card"
import { ModalHeader } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { getStoreUID } from "@next-boilerplate/cli-helpers/stores"
import { Button } from "@nextui-org/button"
import { Modal, ModalBody, ModalContent, ModalFooter } from "@nextui-org/modal"

import { StoresContentDr } from "./content.dr"

const formSchema = updateConfigurationRequestSchema().shape.configuration.shape.stores.unwrap().element

export default function StoresContent({
  ssrConfiguration,
  ssrStores,
  dictionary,
}: {
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  ssrStores: RouterOutputs["stores"]["getStores"]
  dictionary: TDictionary<typeof StoresContentDr>
}) {
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })
  const stores = trpc.stores.getStores.useQuery(undefined, {
    initialData: ssrStores,
  })

  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false)

  const utils = trpc.useUtils()
  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.configuration.invalidate(),
        utils.stores.invalidate(),
        utils.plugins.invalidate(),
        utils.templates.invalidate(),
      ])
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      version: "",
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await updateConfigurationMutation.mutateAsync({
      configuration: {
        stores: [
          ...(configuration.data.configuration.stores ?? []),
          {
            name: data.name,
            version: data.version,
          },
        ]
          // Remove duplicates
          .filter((store, index, self) => self.findIndex((s) => getStoreUID(s) === getStoreUID(store)) === index),
      },
    })
    setIsAddStoreOpen(false)
  })

  const installOrUpdateStoreMutation = trpc.stores.installOrUpdateStore.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.configuration.invalidate(),
        utils.stores.invalidate(),
        utils.plugins.invalidate(),
        utils.templates.invalidate(),
      ])
      form.reset()
    },
  })

  const deleteStoreMutation = trpc.stores.deleteStore.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.configuration.invalidate(),
        utils.stores.invalidate(),
        utils.plugins.invalidate(),
        utils.templates.invalidate(),
      ])
    },
  })

  const isPending =
    updateConfigurationMutation.isPending || installOrUpdateStoreMutation.isPending || deleteStoreMutation.isPending

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
        {(configuration.data.configuration.stores ?? []).map((store) => (
          <ItemCard
            notClickable
            actions={
              <>
                {
                  // Check if the store is already installed
                  stores.data.stores.some((s) => getStoreUID(s) === getStoreUID(store)) ? (
                    <Button
                      variant="light"
                      color="warning"
                      onPress={() => {
                        installOrUpdateStoreMutation.mutate({
                          store,
                        })
                      }}
                      isLoading={isPending}
                    >
                      <Download className="size-5" />
                      {dictionary.update}
                    </Button>
                  ) : (
                    <Button
                      variant="light"
                      color="success"
                      onPress={() => {
                        installOrUpdateStoreMutation.mutate({
                          store,
                        })
                      }}
                      isLoading={isPending}
                    >
                      <Download className="size-5" />
                      {dictionary.download}
                    </Button>
                  )
                }
                <Button
                  variant="light"
                  className="size-[40px] min-w-0 p-1"
                  color="danger"
                  aria-label={dictionary.remove}
                  onPress={() => {
                    deleteStoreMutation.mutate({
                      store,
                    })
                  }}
                  isLoading={isPending}
                >
                  <Icons.trash className="size-5" />
                </Button>
              </>
            }
            key={getStoreUID(store)}
            id={getStoreUID(store)}
            title={store.name}
            description={dictionary.storeVersion + ": " + store.version}
          />
        ))}
      </ul>
      <Modal isOpen={isAddStoreOpen} onOpenChange={setIsAddStoreOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{dictionary.addStore}</ModalHeader>
              <form onSubmit={onSubmit}>
                <ModalBody>
                  <p className="text-xs text-warning">{dictionary.doNotTrustExternalStores}</p>
                  <FormField
                    label={dictionary.storeName}
                    placeholder={dictionary.storeNameExample}
                    type="text"
                    name="name"
                    form={form}
                  />
                  <FormField
                    label={dictionary.storeVersion}
                    placeholder={dictionary.storeVersionExample}
                    type="text"
                    name="version"
                    form={form}
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
