import { useState } from "react"
import { useRouter } from "next/navigation"

import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import OtpInput from "@/components/ui/otp-input"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"
import { Button, Modal, ModalBody, ModalContent, ModalFooter } from "@nextui-org/react"

export type TotpVerificationModalProps = {
  dictionary: TDictionary
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccessfulVerification?: () => void
  title: string
  submitText: string
  closeText: string
  onlyPrompt?: boolean
  onConfirm?: (otp: string) => void
}

export default function TotpVerificationModal({
  dictionary,
  isOpen,
  onOpenChange,
  onSuccessfulVerification,
  title,
  submitText,
  closeText,
  onlyPrompt,
  onConfirm,
}: TotpVerificationModalProps) {
  const router = useRouter()

  const verifyTotpMutation = trpc.auth.verifyTotp.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
  })

  const [otp, setOtp] = useState(new Array(6).fill(""))

  const handleConfirm = async () => {
    if (onlyPrompt) {
      onConfirm?.(otp.join(""))
      setOtp(new Array(6).fill(""))
      return
    }
    await verifyTotpMutation.mutateAsync({
      token: otp.join(""),
    })
    if (verifyTotpMutation.isSuccess) {
      onSuccessfulVerification?.()
      setOtp(new Array(6).fill(""))
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <OtpInput otp={otp} setOtp={setOtp} />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="flat"
                onPress={() => {
                  onClose()
                  setOtp(new Array(6).fill(""))
                }}
              >
                {closeText}
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleConfirm()
                }}
                isDisabled={otp.length !== 6}
                isLoading={verifyTotpMutation.isLoading}
              >
                {submitText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
