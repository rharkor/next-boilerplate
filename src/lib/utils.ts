import { type ClassValue, clsx } from "clsx"
import { NextResponse } from "next/server"
import { twMerge } from "tailwind-merge"
import { IApiError } from "@/types"
import { logger } from "./logger"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function isApiError(error: unknown): error is IApiError {
  return typeof error === "object" && error !== null && "status" in error && "message" in error
}

export async function handleFetch(
  fetch: Promise<Response>,
  onError: (error: string) => void = (error) => logger.error(error)
): Promise<unknown | void> {
  try {
    const response = await fetch
    if (!response.ok) {
      let data: unknown
      try {
        data = await response.json()
      } catch (error: unknown) {
        throw new Error(response.statusText)
      }
      if (isApiError(data)) {
        throw new Error(data.message)
      } else {
        throw new Error(response.statusText)
      }
    }
    const data = await response.json()
    return data
  } catch (error: unknown) {
    logger.error(error)
    if (error instanceof Error) {
      onError(error.message)
    } else {
      onError("An unknown error occurred")
    }
  }
}

export function ApiError(message: string, init?: ResponseInit | undefined): NextResponse<unknown> {
  const content: IApiError = {
    status: "error",
    message: message,
  }
  return new NextResponse(JSON.stringify(content), init)
}
