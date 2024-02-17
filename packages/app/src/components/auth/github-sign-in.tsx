"use client"

import { useState } from "react"

import { Button, Spinner } from "@nextui-org/react"

import { Icons } from "../icons"

export default function GithubSignIn({
  providerId,
  handleSignIn,
}: {
  providerId: string
  handleSignIn: ({ depth, otp, providerId }: { depth?: number; otp?: string; providerId: string }) => Promise<void>
}) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        color="primary"
        type="button"
        onClick={() => {
          setIsLoading(true)
          handleSignIn({ providerId }).finally(() => setIsLoading(false))
        }}
        isDisabled={isLoading}
      >
        {isLoading ? (
          <Spinner classNames={{ base: "mr-2", wrapper: "h-4 w-4" }} color="current" size="sm" />
        ) : (
          <Icons.gitHub className="mr-2 size-4" />
        )}
        Github
      </Button>
    </>
  )
}
