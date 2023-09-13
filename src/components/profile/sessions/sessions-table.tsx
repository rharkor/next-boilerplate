"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

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
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import SessionRow from "./session-row"

const itemsPerPageInitial = 5

export default function SessionsTable({ dictionary }: { dictionary: TDictionary }) {
  const router = useRouter()
  const utils = trpc.useContext()

  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageInitial)

  const callParams = {
    page: currentPage,
    perPage: itemsPerPage,
  }
  const activeSessions = useActiveSessions(dictionary, callParams)

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
          data: prev?.data?.filter((session) => session.id !== selectedSession),
        }
    )

    //? Delete from DB
    deleteSessionMutation.mutate({ id: selectedSession })
  }

  const rows = activeSessions?.data?.data?.map((session) => (
    <SessionRow session={session} setSelectedSession={setSelectedSession} key={session.id} />
  ))

  const skelRows = (
    <>
      {Array.from({ length: itemsPerPageInitial }).map((_, i) => (
        <SessionRow skeleton key={i} />
      ))}
    </>
  )

  const showPagination = Boolean(
    activeSessions?.data && (activeSessions?.data.meta.totalPages > 1 || itemsPerPageInitial !== itemsPerPage)
  )

  return (
    <div className="mt-4 flex flex-col space-y-4">
      <AlertDialog>
        {activeSessions.isFetched ? rows : skelRows}
        <Pagination
          show={showPagination}
          currentNumberOfItems={activeSessions?.data?.data?.length ?? 0}
          currentPage={activeSessions?.data?.meta.page}
          totalPages={activeSessions?.data?.meta.totalPages}
          setCurrentPage={setCurrentPage}
          itemsPerPage={activeSessions?.data?.meta.perPage}
          setItemsPerPage={setItemsPerPage}
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
    </div>
  )
}
