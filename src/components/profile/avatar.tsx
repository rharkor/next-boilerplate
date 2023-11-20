"use client"

import { Avatar, Button, Modal, ModalBody, ModalContent } from "@nextui-org/react"
import { Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"
import { useAccount } from "@/contexts/account"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { getImageUrl, handleMutationError } from "@/lib/utils/client-utils"
import FileUpload from "../ui/file-upload"
import { ModalHeader, ModalTitle } from "../ui/modal"

export default function UpdateAvatar({
  account,
  dictionary,
}: {
  account: ReturnType<typeof useAccount>
  dictionary: TDictionary
}) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const getpresignedUrlMutation = trpc.upload.presignedUrl.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
  })
  const updateUserMutation = trpc.me.updateUser.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
  })

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      toast.error(dictionary.errors.noFileSelected)
      return
    }

    setUploading(true)
    try {
      const { url, fields } = await getpresignedUrlMutation.mutateAsync({
        filename: file.name,
        filetype: file.type,
        kind: "avatar",
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
            image: fields.key,
          })

          toast.success(dictionary.avatarUpdated)
          utils.me.getAccount.invalidate()

          setShowModal(false)
        } else {
          toast.error(dictionary.errors.unknownError)
        }
      } catch (e) {
        toast.error(dictionary.errors.unknownError)
      }
    } catch {
    } finally {
      setUploading(false)
    }
  }

  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className={cn("group relative h-20 w-20 rounded-full")}>
        <Avatar
          className="h-20 w-20 text-large"
          src={getImageUrl(account.data?.user.image) || undefined}
          name={account.data?.user.username || undefined}
          onClick={() => setShowModal(true)}
        />
        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-muted/40 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100"
          onClick={() => setShowModal(true)}
        >
          <Camera className="h-8 w-8 transition-all duration-250 group-active:scale-95" />
        </div>
      </div>
      <Modal isOpen={showModal} onOpenChange={(open) => setShowModal(open)} backdrop="blur">
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{dictionary.updateAvatar}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <FileUpload
                onFilesChange={(files) => {
                  setFile(files[0])
                }}
                accept={{
                  "image/png": [".png"],
                  "image/jpeg": [".jpg", ".jpeg"],
                }}
                dictionary={dictionary}
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
