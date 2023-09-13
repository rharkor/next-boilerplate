import { Prisma } from "@prisma/client"
import { Dispatch, SetStateAction } from "react"
import { UAParser } from "ua-parser-js"
import { Icons } from "@/components/icons"
import { AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TDictionary } from "@/lib/langs"
import { getTimeBetween } from "@/lib/utils"
import GetDeviceIcon from "../get-device-icon"

export type InitialRowProps = {
  dictionary: TDictionary
}

export type RowProps = InitialRowProps &
  (
    | {
        session: Prisma.SessionGetPayload<undefined>
        setSelectedSession: Dispatch<SetStateAction<string | null>>
        skeleton?: never
      }
    | {
        session?: never
        setSelectedSession?: never
        skeleton: true
      }
  )

export default function SessionRow({ session, setSelectedSession, skeleton, dictionary }: RowProps) {
  const userAgents = session ? new UAParser(session.ua).getResult() : undefined

  return (
    <div className="grid items-center space-x-4 md:grid-cols-[1fr,1fr,1fr,1fr,auto]">
      <div className="flex flex-col space-y-1">
        <div className="flex flex-row space-x-2">
          <div className="flex flex-col space-y-1">
            <div className="flex flex-row items-center space-x-2">
              {skeleton ? <Skeleton className="h-5 w-5" /> : <GetDeviceIcon name={userAgents?.os.name} />}
              {skeleton ? (
                <Skeleton className="h-4 w-9" />
              ) : (
                <p className="text-sm font-medium">{userAgents?.os.name}</p>
              )}
            </div>
          </div>
        </div>
        {skeleton ? (
          <Skeleton className="h-4 w-9" />
        ) : (
          <p className="text-xs text-muted-foreground">{userAgents?.browser.name}</p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-xs text-muted-foreground">{dictionary.profilePage.profileDetails.lastUsed}</p>
        {skeleton ? (
          <Skeleton className="h-4 w-8" />
        ) : (
          <p className="text-xs text-muted-foreground">
            {session.lastUsedAt
              ? getTimeBetween(new Date(session.lastUsedAt), new Date(), {
                  dictionary,
                })
              : "never"}
          </p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-xs text-muted-foreground">{dictionary.profilePage.profileDetails.created}</p>
        {skeleton ? (
          <Skeleton className="h-4 w-10" />
        ) : (
          <p className="text-xs text-muted-foreground">{new Date(session.createdAt).toLocaleDateString()}</p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-xs text-muted-foreground">{dictionary.profilePage.profileDetails.expires}</p>
        {skeleton ? (
          <Skeleton className="h-4 w-10" />
        ) : (
          <p className="text-xs text-muted-foreground">
            {dictionary.profilePage.profileDetails.in}{" "}
            {getTimeBetween(new Date(session.expires), new Date(), {
              dictionary,
            })}
          </p>
        )}
      </div>
      <div className="flex flex-row space-x-2">
        {skeleton ? (
          <Skeleton className="h-8 w-10" />
        ) : (
          <AlertDialogTrigger asChild>
            <Button variant={"destructive"} size={"sm"} onClick={() => setSelectedSession(session.id)}>
              <Icons.trash />
            </Button>
          </AlertDialogTrigger>
        )}
      </div>
    </div>
  )
}
