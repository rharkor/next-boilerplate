"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Pagination from "@/components/ui/pagination"
import { useActiveSessions } from "@/contexts/active-sessions"
import { handleMutationError } from "@/lib/client-utils"
import { IMeta } from "@/lib/json-api"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import SessionRow from "./session-row"

const itemsPerPageInitial = 5

export default function SessionsTable({ dictionary, isDisabled }: { dictionary: TDictionary; isDisabled?: boolean }) {
  const router = useRouter()
  const utils = trpc.useContext()

  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageInitial)

  const callParams = {
    page: currentPage,
    perPage: itemsPerPage,
  }
  const activeSessions = useActiveSessions(dictionary, callParams, {
    disabled: isDisabled,
  })
  const [meta, setMeta] = useState<IMeta | undefined>(activeSessions.data?.meta)

  useEffect(() => {
    if (activeSessions.isLoading) return
    setMeta(activeSessions.data?.meta)
  }, [activeSessions])

  const deleteSessionMutation = trpc.me.deleteSession.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
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
        <SessionRow skeleton key={i} dictionary={dictionary} />
      ))}
    </>
  )

  const showPagination = Boolean((meta && meta.totalPages > 1) || itemsPerPageInitial !== itemsPerPage)

  return (
    <div className="relative mt-4 flex flex-col space-y-4">
      <AlertDialog>
        {activeSessions.isFetched ? rows : skelRows}
        <Pagination
          show={showPagination}
          isLoading={activeSessions.isLoading}
          currentNumberOfItems={activeSessions.data?.data?.length ?? 0}
          currentPage={meta?.page}
          totalPages={meta?.totalPages}
          setCurrentPage={setCurrentPage}
          itemsPerPage={meta?.perPage}
          setItemsPerPage={setItemsPerPage}
          dictionary={dictionary}
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.areYouAbsolutelySure}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.profilePage.profileDetails.deleteLoggedDevice.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dictionary.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSession}>{dictionary.continue}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isDisabled && (
        <div className="absolute inset-0 !mt-0 flex flex-col items-center justify-center backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">{dictionary.profilePage.unavailableWithOAuth}</p>
        </div>
      )}
    </div>
  )
}
