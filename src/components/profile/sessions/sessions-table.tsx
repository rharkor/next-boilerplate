"use client"

import { Prisma } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
import { toast } from "@/components/ui/use-toast"
import { useApiStore } from "@/contexts/api.store"
import { IJsonApiResponse, jsonApiQuery } from "@/lib/json-api"
import { formatCouldNotMessage } from "@/lib/utils"
import SessionRow from "./session-row"

const itemsPerPageInitial = 5

export default function SessionsTable({
  dictionary,
}: {
  dictionary: {
    areYouAbsolutelySure: string
    deleteLoggedDevice: {
      description: string
    }
    cancel: string
    continue: string
    session: string
    sessions: string
    error: string
    delete: string
    fetch: string
    couldNotMessage: string
  }
}) {
  const { data: curSession } = useSession()
  const router = useRouter()
  const apiFetch = useApiStore((state) => state.apiFetch(router))

  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageInitial)

  const {
    data: sessionsFromFetch,
    refetch,
    isFetched: isSessionFetched,
  } = useQuery({
    queryKey: ["session", curSession, currentPage, itemsPerPage],
    queryFn: async () => {
      const res = (await apiFetch(
        fetch(
          `/api/sessions/active?${jsonApiQuery({
            page: currentPage,
            perPage: itemsPerPage,
            sort: ["-lastUsedAt"],
          })}`
        ),
        () => {
          toast({
            title: dictionary.error,
            description: formatCouldNotMessage({
              couldNotMessage: dictionary.couldNotMessage,
              action: dictionary.fetch,
              subject: dictionary.sessions,
            }),
            variant: "destructive",
          })
        }
      )) as IJsonApiResponse<Prisma.SessionGetPayload<undefined>> | void
      return res
    },
    enabled: !!curSession?.user?.id,
  })
  const [sessions, setSessions] = useState(sessionsFromFetch)

  useEffect(() => {
    if (!sessionsFromFetch) return
    setSessions(sessionsFromFetch)
  }, [sessionsFromFetch])

  const deleteSession = async () => {
    if (!selectedSession) return
    //? Delete from UI
    setSessions((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        data: prev.data?.filter((session) => session.id !== selectedSession),
      }
    })
    //? Delete from DB
    const res = await apiFetch(fetch(`/api/sessions/${selectedSession}`, { method: "DELETE" }), () => {
      toast({
        title: dictionary.error,
        description: formatCouldNotMessage({
          couldNotMessage: dictionary.couldNotMessage,
          action: dictionary.delete,
          subject: dictionary.session,
        }),
        variant: "destructive",
      })
    })
    if (res) {
      setSelectedSession(null)
      await refetch()
    }
  }

  const rows = sessions?.data?.map((session) => (
    <SessionRow session={session} setSelectedSession={setSelectedSession} key={session.id} />
  ))

  const skelRows = (
    <>
      {Array.from({ length: itemsPerPageInitial }).map((_, i) => (
        <SessionRow skeleton key={i} />
      ))}
    </>
  )

  const showPagination = Boolean(sessions && (sessions.meta.totalPages > 1 || itemsPerPageInitial !== itemsPerPage))

  return (
    <div className="mt-4 flex flex-col space-y-4">
      <AlertDialog>
        {isSessionFetched || sessions ? rows : skelRows}
        <Pagination
          show={showPagination}
          currentNumberOfItems={sessions?.data?.length ?? 0}
          currentPage={sessions?.meta.page}
          totalPages={sessions?.meta.totalPages}
          setCurrentPage={setCurrentPage}
          itemsPerPage={sessions?.meta.perPage}
          setItemsPerPage={setItemsPerPage}
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.areYouAbsolutelySure}</AlertDialogTitle>
            <AlertDialogDescription>{dictionary.deleteLoggedDevice.description}</AlertDialogDescription>
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
