import { Dispatch, SetStateAction } from "react"
import { UAParser } from "ua-parser-js"
import { z } from "zod"

import { Icons } from "@/components/icons"
import { TDictionary } from "@/lib/langs"
import { sessionsSchema } from "@/lib/schemas/user"
import { cn, getTimeBetween } from "@/lib/utils"
import { Button, Skeleton as NSkeleton } from "@nextui-org/react"

import GetDeviceIcon from "../get-device-icon"

export type InitialRowProps = {
  dictionary: TDictionary
}

export type RowProps = InitialRowProps &
  (
    | {
        session: z.infer<ReturnType<typeof sessionsSchema>>
        setSelectedSession: Dispatch<SetStateAction<string | null>>
        skeleton?: never
        skeletonAnimation?: never
      }
    | {
        session?: never
        setSelectedSession?: never
        skeleton: true
        skeletonAnimation: boolean
      }
  )

function Skeleton({ className, disableAnimation }: { className?: string; disableAnimation?: boolean }) {
  return (
    <NSkeleton
      className={cn(className, "!duration-1000 before:!duration-1000 after:!duration-1000", {
        "!animate-none before:!animate-none after:!animate-none": disableAnimation,
      })}
      disableAnimation={disableAnimation}
    />
  )
}

export default function SessionRow({ session, setSelectedSession, skeleton, skeletonAnimation, dictionary }: RowProps) {
  const userAgents = session ? new UAParser(session.ua).getResult() : undefined

  return (
    <li className="grid min-w-[475px] grid-cols-[1fr,1fr,1fr,1fr,auto] items-center space-x-4">
      <div className="flex flex-col space-y-1">
        <div className="flex flex-row space-x-2">
          <div className="flex flex-col space-y-1">
            <div className="flex flex-row items-center space-x-2">
              {skeleton ? (
                <Skeleton className="size-5 rounded-full" disableAnimation={!skeletonAnimation} />
              ) : (
                <GetDeviceIcon name={userAgents?.os.name} />
              )}
              {skeleton ? (
                <Skeleton className="h-4 w-9 rounded-full" disableAnimation={!skeletonAnimation} />
              ) : (
                <p className="text-sm font-medium">{userAgents?.os.name}</p>
              )}
            </div>
          </div>
        </div>
        {skeleton ? (
          <Skeleton className="h-4 w-9 rounded-full" disableAnimation={!skeletonAnimation} />
        ) : (
          <p className="text-muted-foreground text-xs">{userAgents?.browser.name}</p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-muted-foreground text-xs">{dictionary.profilePage.profileDetails.lastUsed}</p>
        {skeleton ? (
          <Skeleton className="h-4 w-8 rounded-full" disableAnimation={!skeletonAnimation} />
        ) : (
          <p className="text-muted-foreground text-xs">
            {session.lastUsedAt
              ? getTimeBetween(new Date(session.lastUsedAt), new Date(), {
                  dictionary,
                })
              : "never"}
          </p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-muted-foreground text-xs">{dictionary.profilePage.profileDetails.created}</p>
        {skeleton ? (
          <Skeleton className="h-4 w-10 rounded-full" disableAnimation={!skeletonAnimation} />
        ) : (
          <p className="text-muted-foreground text-xs">{new Date(session.createdAt).toLocaleDateString()}</p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-muted-foreground text-xs">{dictionary.profilePage.profileDetails.expires}</p>
        {skeleton ? (
          <Skeleton className="h-4 w-10 rounded-full" disableAnimation={!skeletonAnimation} />
        ) : (
          <p className="text-muted-foreground text-xs">
            {dictionary.profilePage.profileDetails.in}{" "}
            {getTimeBetween(new Date(session.expires), new Date(), {
              dictionary,
            })}
          </p>
        )}
      </div>
      <div className="flex flex-row space-x-2">
        {skeleton ? (
          <Skeleton className="mr-1 h-8 w-10 rounded-full" disableAnimation={!skeletonAnimation} />
        ) : (
          <Button
            color="danger"
            className="mr-1 h-8 w-10 min-w-0 p-2"
            size={"sm"}
            aria-label="delete"
            onClick={() => setSelectedSession(session.id)}
          >
            <Icons.trash />
          </Button>
        )}
      </div>
    </li>
  )
}
