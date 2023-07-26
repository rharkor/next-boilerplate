"use client"

import { Prisma } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
import { toast } from "@/components/ui/use-toast"
import { useApiStore } from "@/contexts/api.store"
import { IJsonApiResponse, jsonApiQuery } from "@/lib/json-api"
import SessionRow from "./session-row"

const itemsPerPageInitial = 5

export default function SessionsTable() {
  const { data: curSession } = useSession()
  const router = useRouter()
  const apiFetch = useApiStore((state) => state.apiFetch(router))

  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageInitial)

  const { data: sessions, refetch } = useQuery({
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
            title: "Error",
            description: "Could not fetch sessions. Please try again later.",
            variant: "destructive",
          })
        }
      )) as IJsonApiResponse<Prisma.SessionGetPayload<undefined>>
      return res
    },
    enabled: !!curSession?.user?.id,
  })

  const deleteSession = async () => {
    if (!selectedSession) return
    const res = await apiFetch(fetch(`/api/sessions/${selectedSession}`, { method: "DELETE" }), () => {
      toast({
        title: "Error",
        description: "Could not delete session. Please try again later.",
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
      <SessionRow skeleton />
      <SessionRow skeleton />
      <SessionRow skeleton />
    </>
  )

  return (
    <section>
      <header>
        <h3 className="text-lg font-medium">Logged in devices</h3>
        <p className="text-sm text-muted-foreground">You can manage your logged in devices here.</p>
      </header>
      <div className="mt-4 flex flex-col space-y-4">
        <AlertDialog>
          {sessions ? rows : skelRows}
          <Pagination
            show={sessions && (sessions.meta.totalPages > 1 || itemsPerPageInitial !== itemsPerPage)}
            currentNumberOfItems={sessions?.data?.length ?? 0}
            currentPage={sessions?.meta.page}
            totalPages={sessions?.meta.totalPages}
            setCurrentPage={setCurrentPage}
            itemsPerPage={sessions?.meta.perPage}
            setItemsPerPage={setItemsPerPage}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will disconnect the device connected to this session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteSession}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  )
}
