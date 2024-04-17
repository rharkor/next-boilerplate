"use client"

import { useState } from "react"
import { Camera } from "lucide-react"
import { toast } from "react-toastify"

import { maxUploadSize } from "@/constants"
import { useAccount } from "@/contexts/account"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/utils/client-utils"
import { logger } from "@next-boilerplate/lib"
import { Avatar, Button, Modal, ModalBody, ModalContent, Skeleton, Spinner } from "@nextui-org/react"

import { Icons } from "../icons"
import FileUpload from "../ui/file-upload"
import { ModalHeader, ModalTitle } from "../ui/modal"

import { UpdateAvatarDr } from "./avatar.dr"

export default function UpdateAvatar({
  account,
  dictionary,
}: {
  account: ReturnType<typeof useAccount>
  dictionary: TDictionary<typeof UpdateAvatarDr>
}) {
  const utils = trpc.useUtils()

  const getPresignedUrlMutation = trpc.upload.presignedUrl.useMutation()
  const updateUserMutation = trpc.me.updateUser.useMutation()

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      toast.error(dictionary.errors.noFileSelected)
      return
    }
    if (file.size > maxUploadSize) {
      toast.error(dictionary.errors.fileTooLarge)
      return
    }
    setUploading(true)
    try {
      const { url, fields } = await getPresignedUrlMutation.mutateAsync({
        filename: file.name,
        filetype: file.type,
      })

      try {
        const formData = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string)
        })
        formData.append("file", file)

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          await updateUserMutation.mutateAsync({
            profilePictureKey: fields.key,
          })

          utils.me.getAccount.invalidate()

          setShowModal(false)
        } else {
          const xml = await uploadResponse.text()
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xml, "text/xml")
          const error = xmlDoc.getElementsByTagName("Message")[0]
          if (error.textContent === "Your proposed upload exceeds the maximum allowed size") {
            toast.error(dictionary.errors.fileTooLarge)
          } else {
            toast.error(dictionary.unknownError)
          }
        }
      } catch (e) {
        logger.error(e)
        toast.error(dictionary.unknownError)
      }
    } catch {
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    await updateUserMutation.mutateAsync({
      profilePictureKey: null,
    })

    utils.me.getAccount.invalidate()

    setShowModal(false)
  }

  const [showModal, _setShowModal] = useState(false)
  const setShowModal = (show: boolean) => {
    if (show) {
      const active = document.activeElement as HTMLButtonElement | null
      active?.blur()
    }
    _setShowModal(show)
  }

  return (
    <>
      <div className={cn("group relative h-20 w-20 rounded-full")}>
        <Skeleton isLoaded={!account.isLoading} className={cn("rounded-full")}>
          <Avatar
            className="!size-20 text-large"
            src={getImageUrl(account.data?.user.profilePicture) || undefined}
            name={account.data?.user.username || undefined}
            onClick={() => setShowModal(true)}
          />
        </Skeleton>
        <Button
          className={cn(
            "upload-group group absolute inset-0 flex h-[unset] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-muted/10 opacity-0 backdrop-blur-sm transition-all duration-200",
            "focus:opacity-100 group-hover:opacity-100 group-focus:opacity-100",
            {
              hidden: account.isLoading,
            }
          )}
          onPress={() => setShowModal(true)}
        >
          <Camera className="size-8 transition-all duration-250 group-[.upload-group]:active:scale-95" />
        </Button>
        <Button
          color="danger"
          className={cn(
            "absolute right-0 top-0 h-[unset] min-w-0 rounded-full p-1.5 text-foreground opacity-0 transition-all duration-200 focus:opacity-100 group-hover:opacity-100 group-focus:opacity-100",
            {
              hidden: account.isLoading || !account.data?.user.profilePicture,
            }
          )}
          onPress={() => handleDelete()}
        >
          {updateUserMutation.isLoading ? (
            <Spinner
              classNames={{
                wrapper: "size-4",
              }}
              color="current"
              size="sm"
            />
          ) : (
            <Icons.trash className="size-4" />
          )}
        </Button>
      </div>
      <Modal isOpen={showModal} onOpenChange={(open) => setShowModal(open)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{dictionary.updateAvatar}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <FileUpload
                dictionary={dictionary}
                onFilesChange={(files) => {
                  setFile(files[0])
                }}
                maxFiles={1}
                accept={{
                  "image/png": [".png"],
                  "image/jpeg": [".jpg", ".jpeg"],
                }}
                disabled={uploading}
              />
              <Button color="primary" type="submit" isDisabled={uploading || !file} isLoading={uploading}>
                {dictionary.updateAvatar}
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
