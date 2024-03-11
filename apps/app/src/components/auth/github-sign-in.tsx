"use client"

import { useState } from "react"

import { Button, Spinner } from "@nextui-org/react"

import { Icons } from "../icons"

export default function GithubSignIn({
  providerId,
  handleSignIn,
}: {
  providerId: string
  handleSignIn: ({ depth, otp, providerId }: { depth?: number; otp?: string; providerId: string }) => Promise<boolean>
}) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        color="primary"
        type="button"
        onPress={async () => {
          setIsLoading(true)
          const res = await handleSignIn({ providerId })
          // If not a success
          if (!res) setIsLoading(false)
        }}
        isDisabled={isLoading}
      >
        {isLoading ? (
          <Spinner classNames={{ base: "mr-2", wrapper: "size-4" }} color="current" size="sm" />
        ) : (
          <Icons.gitHub className="mr-2 size-4" />
        )}
        Github
      </Button>
    </>
  )
}
