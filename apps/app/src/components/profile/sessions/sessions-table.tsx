"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

import { ModalDescription, ModalHeader, ModalTitle } from "@/components/ui/modal"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { Button, Modal, ModalContent, ModalFooter, Pagination } from "@nextui-org/react"

import SessionRow from "./session-row"
import { SessionsTableDr } from "./sessions-table.dr"

const itemsPerPageInitial = 5

export default function SessionsTable({ dictionary }: { dictionary: TDictionary<typeof SessionsTableDr> }) {
  const session = useSession()
  const utils = trpc.useUtils()

  const isDisabled = !!session.data && session.data.user.hasPassword === false

  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const callParams = {
    page: currentPage,
    perPage: itemsPerPageInitial,
  }

  const activeSessions = trpc.me.getActiveSessions.useQuery(callParams, {
    enabled: !!session.data && session.data.user.hasPassword !== false,
  })
  const meta = activeSessions.data?.meta

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
      {meta && (
        <Pagination
          className={cn("ml-auto max-h-[50px] max-w-full overflow-y-hidden transition-all duration-300", {
            "!m-0 max-h-0 p-0": !showPagination,
          })}
          total={meta.totalPages}
          page={meta.page}
          onChange={setCurrentPage}
        />
      )}
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
          <p className="text-sm font-semibold text-muted-foreground">{dictionary.errors.unavailableWithOAuth}</p>
        </div>
      )}
    </div>
  )
}
