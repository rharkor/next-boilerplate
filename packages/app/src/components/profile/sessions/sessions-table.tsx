"use client"

import { useEffect, useState } from "react"

import { ModalDescription, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { useActiveSessions } from "@/contexts/active-sessions"
import { useDictionary } from "@/contexts/dictionary/utils"
import { IMeta } from "@/lib/json-api"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { Button, Modal, ModalContent, ModalFooter, Pagination } from "@nextui-org/react"

import SessionRow from "./session-row"

const itemsPerPageInitial = 5

export default function SessionsTable({ isDisabled }: { isDisabled?: boolean }) {
  const dictionary = useDictionary()
  const utils = trpc.useUtils()

  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const callParams = {
    page: currentPage,
  }
  const activeSessions = useActiveSessions(callParams, {
    disabled: isDisabled,
  })
  const [meta, setMeta] = useState<IMeta | undefined>(activeSessions.data?.meta)

  useEffect(() => {
    if (activeSessions.isLoading) return
    setMeta(activeSessions.data?.meta)
  }, [activeSessions])

  const deleteSessionMutation = trpc.me.deleteSession.useMutation({
    onSettled: () => {
      setSelectedSession(null)
      utils.me.getActiveSessions.invalidate(callParams)
    },
  })

  const deleteSession = async () => {
    if (!selectedSession) return
    utils.me.getActiveSessions.setData(
      callParams,
      (prev) =>
        prev && {
          ...prev,
          data: prev.data?.filter((session) => session.id !== selectedSession),
        }
    )

    //? Delete from DB
    deleteSessionMutation.mutate({ id: selectedSession })
  }

  const rows = activeSessions.data?.data?.map((session) => (
    <SessionRow session={session} setSelectedSession={setSelectedSession} key={session.id} dictionary={dictionary} />
  ))

  const skelRows = (
    <>
      {Array.from({ length: itemsPerPageInitial }).map((_, i) => (
        <SessionRow skeleton skeletonAnimation={!isDisabled} key={i} dictionary={dictionary} />
      ))}
    </>
  )

  const showPagination = Boolean(meta && meta.totalPages > 1)

  return (
    <div className="relative mt-4 flex flex-col space-y-4">
      <ul className="flex flex-col space-y-4 overflow-hidden overflow-x-auto">
        {activeSessions.isFetched ? rows : skelRows}
      </ul>
      <Pagination
        className={cn("ml-auto max-h-[50px] max-w-full overflow-y-hidden transition-all duration-300", {
          "!m-0 max-h-0 p-0": !showPagination,
        })}
        total={meta?.totalPages ?? 1}
        page={meta?.page ?? 1}
        onChange={setCurrentPage}
      />
      <Modal isOpen={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <ModalTitle>{dictionary.areYouAbsolutelySure}</ModalTitle>
                <ModalDescription>
                  {dictionary.profilePage.profileDetails.deleteLoggedDevice.description}
                </ModalDescription>
              </ModalHeader>
              <ModalFooter>
                <Button variant="flat" onClick={onClose}>
                  {dictionary.cancel}
                </Button>
                <Button color="primary" onClick={deleteSession}>
                  {dictionary.continue}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {isDisabled && (
        <div className="absolute -inset-2 !mt-0 flex flex-col items-center justify-center backdrop-blur-sm">
          <p className="text-muted-foreground text-sm font-semibold">{dictionary.errors.unavailableWithOAuth}</p>
        </div>
      )}
    </div>
  )
}
