"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { authRoutes } from "@/constants/auth"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { Button, Modal, ModalContent, ModalFooter } from "@nextui-org/react"

import { ModalDescription, ModalHeader, ModalTitle } from "../ui/modal"

import { DeleteAccountButtonDr } from "./delete-account-button.dr"

export default function DeleteAccountButton({
  children,
  dictionary,
}: {
  children: React.ReactNode
  dictionary: TDictionary<typeof DeleteAccountButtonDr>
}) {
  const router = useRouter()
  const deleteAccountMutation = trpc.me.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success(dictionary.deleteAccountSuccessDescription)
      router.push(authRoutes.signUp[0])
    },
  })

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate()
  }

  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button color="danger" isLoading={deleteAccountMutation.isLoading} onClick={() => setShowModal(true)}>
        {children}
      </Button>
      <Modal isOpen={showModal} onOpenChange={(open) => setShowModal(open)}>
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
                <Button color="danger" onPress={handleDeleteAccount} isLoading={deleteAccountMutation.isLoading}>
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
