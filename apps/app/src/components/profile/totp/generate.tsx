"use client"

import React, { useCallback, useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "react-toastify"

import { Icons } from "@/components/icons"
import { ModalHeader, ModalTitle } from "@/components/ui/modal"
import OtpInput from "@/components/ui/otp-input"
import { useAccount } from "@/contexts/account"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, Skeleton } from "@nextui-org/react"

import { GenerateTotpDr } from "./generate.dr"
import TotpVerificationModal from "./totp-verification-modal"

export default function GenerateTotp({
  account,
  dictionary,
}: {
  account: ReturnType<typeof useAccount>
  dictionary: TDictionary<typeof GenerateTotpDr>
}) {
  const hasOtpVerified = account.data?.user.otpVerified
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)

  const generateTotpSecretMutation = trpc.auth.generateTotpSecret.useMutation()

  const verifyTotpMutation = trpc.auth.verifyTotp.useMutation()

  const [totpSecretData, setTotpSecretData] = useState<{ url: string; mnemonic: string }>()
  const handleGenerateTotpSecret = useCallback(async () => {
    const { url, mnemonic } = await generateTotpSecretMutation.mutateAsync()
    setTotpSecretData({
      url,
      mnemonic,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isModalOpen) return
    if (!totpSecretData) {
      handleGenerateTotpSecret()
    }
  }, [handleGenerateTotpSecret, isModalOpen, totpSecretData])

  const copyToClipboard = (value?: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    toast(dictionary.urlCopiedToClipboard)
  }

  const [mnemonicVerif, setMnemonicVerif] = useState<string>("")
  const [shuffledMnemonic, setShuffledMnemonic] = useState<string[]>([])

  useEffect(() => {
    const mnemonic = totpSecretData?.mnemonic.split(" ")
    if (!mnemonic) return
    const shuffledMnemonic = [...mnemonic].sort(() => Math.random() - 0.5)
    setShuffledMnemonic(shuffledMnemonic)
  }, [totpSecretData])

  const [otp, setOtp] = useState(new Array(6).fill(""))

  const handleConfirm = async () => {
    const otpCode = otp.join("")
    await verifyTotpMutation.mutateAsync({ token: otpCode })
    setIsModalOpen(false)
    setModalIndex(0)
    setOtp(new Array(6).fill(""))
    setMnemonicVerif("")
    setTotpSecretData(undefined)
    account.refetch()
    toast.success(dictionary.totpEnabled)
  }

  const [isDesactivate2FAModalOpen, setDesactivate2FAModalOpen] = useState(false)

  const desactivate2FAMutation = trpc.auth.desactivateTotp.useMutation()

  const handleDesactivate2FA = async (token: string) => {
    await desactivate2FAMutation.mutateAsync({ token })
    account.refetch()
    toast.success(dictionary.totp.totpDesactivated)
    setDesactivate2FAModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="-mx-2 flex flex-col px-2">
        <h3 className="text-medium font-medium">{dictionary.totp.generateTitle}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.totp.generateDescription}</p>
      </div>
      <Button
        color={hasOtpVerified ? "danger" : "primary"}
        onClick={() => {
          if (hasOtpVerified) setDesactivate2FAModalOpen(true)
          else setIsModalOpen(true)
        }}
        isLoading={desactivate2FAMutation.isLoading || generateTotpSecretMutation.isLoading}
        isDisabled={account.isLoading || desactivate2FAMutation.isLoading || generateTotpSecretMutation.isLoading}
        className="w-max"
      >
        {hasOtpVerified ? dictionary.totp.desactivate : dictionary.totp.generate}
      </Button>
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <ModalTitle>{dictionary.totp.generateTitle}</ModalTitle>
              </ModalHeader>
              <ModalBody className="overflow-hidden p-0">
                <div
                  className={cn(
                    "flex h-[372px] flex-row transition-all duration-300 ease-in-out [&>*]:px-6 [&>*]:py-2",
                    { "h-[410px]": modalIndex === 0 }
                  )}
                  style={{
                    transform: `translateX(-${modalIndex * 100}%)`,
                  }}
                >
                  <section
                    className={cn("flex h-full min-w-full flex-col items-center justify-center gap-4 overflow-auto")}
                  >
                    <h4 className="w-full text-medium">
                      <span className="text-lg font-semibold text-foreground">1.</span> {dictionary.totp.generateStep1}
                    </h4>
                    <Skeleton
                      isLoaded={!!totpSecretData}
                      className={cn("w-max shrink-0 rounded-medium !transition-all duration-200", {
                        "cursor-pointer outline outline-0 outline-offset-2 outline-primary focus-visible:outline-4 active:scale-[.98] active:outline-4":
                          !!totpSecretData,
                      })}
                      onClick={() => copyToClipboard(totpSecretData?.url)}
                      tabIndex={modalIndex === 0 ? 0 : -1}
                    >
                      <QRCodeSVG
                        value={totpSecretData?.url ?? ""}
                        size={256}
                        includeMargin
                        className="size-48 lg:size-64"
                      />
                    </Skeleton>
                    <Skeleton
                      isLoaded={!!totpSecretData}
                      className={cn("shrink-0", {
                        "rounded-medium": !totpSecretData,
                      })}
                    >
                      <p className="text-xs text-muted-foreground">({dictionary.totp.generateStep1Description})</p>
                    </Skeleton>
                  </section>
                  <section className={cn("flex h-full min-w-full flex-col items-center gap-4 overflow-auto")}>
                    <div className="flex w-full flex-col">
                      <h4 className="text-medium">
                        <span className="text-lg font-semibold text-foreground">2.</span>{" "}
                        {dictionary.totp.generateStep2}
                      </h4>
                      <p className="text-sm text-muted-foreground">{dictionary.totp.generateStep2Description}</p>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <p className="rounded-medium bg-muted p-2 text-lg">{totpSecretData?.mnemonic}</p>
                    </div>
                  </section>
                  <section className="flex h-full min-w-full flex-col items-center gap-4 overflow-auto">
                    <h4 className="w-full text-medium">
                      <span className="text-lg font-semibold text-foreground">3.</span> {dictionary.totp.generateStep3}
                    </h4>
                    <div className={cn("flex flex-col gap-4")}>
                      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                        {totpSecretData?.mnemonic.split(" ").map((word, index) => (
                          <p
                            className={cn(
                              "group relative h-[34px] w-full min-w-[70px] rounded-medium bg-muted/20 p-1.5 text-sm transition-all hover:bg-primary/30 focus:bg-primary/30",
                              {
                                "bg-danger-50 hover:bg-danger-100":
                                  mnemonicVerif.split(" ")[index] && mnemonicVerif.split(" ")[index] !== word,
                                "before:absolute before:-left-3 before:-translate-x-1/2 before:content-['-'] before:max-[340px]:hidden":
                                  index % 3,
                              }
                            )}
                            key={index}
                          >
                            {mnemonicVerif.split(" ")[index]}
                            <Button
                              className={cn(
                                "absolute left-0 top-0 flex h-full w-full !transform-none items-center justify-end bg-danger/30 opacity-0 hover:opacity-0",
                                {
                                  "hover:opacity-100 focus:opacity-100 group-hover:opacity-100 group-focus:opacity-100":
                                    !!mnemonicVerif.split(" ")[index],
                                }
                              )}
                              tabIndex={!!mnemonicVerif.split(" ")[index] && modalIndex === 2 ? 0 : -1}
                              color="danger"
                              variant="flat"
                              onPress={() => {
                                const newMnemonicVerif = [...mnemonicVerif.split(" ")]
                                newMnemonicVerif[index] = ""
                                setMnemonicVerif(newMnemonicVerif.join(" "))
                              }}
                            >
                              <Icons.trash className="size-4" />
                            </Button>
                          </p>
                        ))}
                      </div>
                      <div className="flex flex-row flex-wrap gap-2">
                        {shuffledMnemonic.map((word, index) => (
                          <Button
                            color="primary"
                            variant="flat"
                            key={index}
                            className={cn("flex-1")}
                            tabIndex={modalIndex === 2 ? 0 : -1}
                            isDisabled={mnemonicVerif.split(" ").includes(word)}
                            onPress={() => {
                              const newMnemonicVerif = [...mnemonicVerif.split(" ")]
                              const firstEmptyIndex = newMnemonicVerif.findIndex((word) => !word)
                              newMnemonicVerif[firstEmptyIndex === -1 ? newMnemonicVerif.length : firstEmptyIndex] =
                                word
                              setMnemonicVerif(newMnemonicVerif.join(" "))
                            }}
                          >
                            {word}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </section>
                  <section className="flex h-full min-w-full flex-col items-center gap-4">
                    <h4 className="w-full text-medium">
                      <span className="text-lg font-semibold text-foreground">4.</span> {dictionary.totp.generateStep4}
                    </h4>
                    <div className={cn("flex flex-1 items-center justify-center")}>
                      <OtpInput isFocusable={modalIndex === 3} otp={otp} setOtp={setOtp} />
                    </div>
                  </section>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    if (modalIndex === 0) {
                      onClose()
                    } else {
                      setModalIndex(modalIndex - 1)
                    }
                  }}
                >
                  {modalIndex === 0 ? dictionary.cancel : dictionary.back}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    if (modalIndex !== 3) {
                      setModalIndex(modalIndex + 1)
                    } else {
                      handleConfirm()
                    }
                  }}
                  isDisabled={
                    (modalIndex === 0 && !totpSecretData) ||
                    (modalIndex === 2 && mnemonicVerif !== totpSecretData?.mnemonic) ||
                    (modalIndex === 3 && otp.length !== 6)
                  }
                  isLoading={verifyTotpMutation.isLoading}
                >
                  {modalIndex !== 3 ? dictionary.continue : dictionary.confirm}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <TotpVerificationModal
        dictionary={dictionary}
        isOpen={isDesactivate2FAModalOpen}
        onOpenChange={setDesactivate2FAModalOpen}
        onConfirm={handleDesactivate2FA}
        title={dictionary.totp.desactivateTitle}
        submitText={dictionary.totp.desactivate}
        closeText={dictionary.cancel}
        onlyPrompt
        isDanger
        isLoading={desactivate2FAMutation.isLoading}
      />
    </div>
  )
}
