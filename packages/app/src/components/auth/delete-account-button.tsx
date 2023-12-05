"use client"

import { Button, Modal, ModalContent, ModalFooter } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"
import { authRoutes } from "@/lib/auth/constants"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"
import { ModalDescription, ModalHeader, ModalTitle } from "../ui/modal"

export default function DeleteAccountButton({
  children,
  dictionary,
}: {
  children: React.ReactNode
  dictionary: TDictionary
}) {
  const router = useRouter()
  const deleteAccountMutation = trpc.me.deleteAccount.useMutation({
    onError: (error) => {
      handleMutationError(error, dictionary, router)
      setIsDeletingAccount(false)
    },
    onSuccess: () => {
      toast.success(dictionary.deleteAccountSuccessDescription)
      router.push(authRoutes.signIn[0])
    },
  })

  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const handleDeleteAccount = () => {
    setIsDeletingAccount(true)
    deleteAccountMutation.mutate()
  }

  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button color="danger" isLoading={isDeletingAccount} onClick={() => setShowModal(true)}>
        {children}
      </Button>
      <Modal isOpen={showModal} onOpenChange={(open) => setShowModal(open)} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <ModalTitle>{dictionary.deleteAccountConfirmationTitle}</ModalTitle>
                <ModalDescription>{dictionary.deleteAccountConfirmationDescription}</ModalDescription>
              </ModalHeader>
              <ModalFooter>
                <Button onPress={onClose} variant="flat">
                  {dictionary.cancel}
                </Button>
                <Button color="danger" onPress={handleDeleteAccount} isLoading={isDeletingAccount}>
                  {dictionary.deleteAccountConfirm}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
