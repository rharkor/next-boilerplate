"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { useDictionary } from "@/contexts/dictionary/utils"
import { authRoutes } from "@/lib/auth/constants"
import { trpc } from "@/lib/trpc/client"
import { Button, Modal, ModalContent, ModalFooter } from "@nextui-org/react"

import { ModalDescription, ModalHeader, ModalTitle } from "../ui/modal"

export default function DeleteAccountButton({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dictionary = useDictionary()
  const deleteAccountMutation = trpc.me.deleteAccount.useMutation({
    onError: () => {
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
