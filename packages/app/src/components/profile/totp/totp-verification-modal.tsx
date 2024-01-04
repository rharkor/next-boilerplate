import { useEffect, useState } from "react"

import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import OtpInput from "@/components/ui/otp-input"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { Button, Link, Modal, ModalBody, ModalContent, ModalFooter } from "@nextui-org/react"

export type TotpVerificationModalProps = {
  dictionary: TDictionary
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccessfulVerification?: () => void
  title: string
  submitText: string
  closeText: string
  onlyPrompt?: boolean
  onConfirm?: (otp: string) => void | Promise<void>
  isDanger?: boolean
  isLoading?: boolean
  curEmail?: string
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
  isDanger,
  isLoading,
  curEmail,
}: TotpVerificationModalProps) {
  const verifyTotpMutation = trpc.auth.verifyTotp.useMutation()

  const [otp, setOtp] = useState(new Array(6).fill(""))

  const handleConfirm = async () => {
    if (onlyPrompt) {
      await onConfirm?.(otp.join(""))
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

  useEffect(() => {
    if (otp.filter((x) => x !== "").length === 6) {
      handleConfirm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
            </ModalHeader>
            <ModalBody className="py-6">
              <OtpInput otp={otp} setOtp={setOtp} withAutoFocus />
              <Link className="ml-auto" href={`/recover-2fa${curEmail ? `?email=${curEmail}` : ""}`}>
                {dictionary.totp.lostYourDevice}
              </Link>
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
                color={isDanger ? "danger" : "primary"}
                onPress={() => {
                  handleConfirm()
                }}
                isDisabled={otp.length !== 6}
                isLoading={verifyTotpMutation.isLoading || isLoading}
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
