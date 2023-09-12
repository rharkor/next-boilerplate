import { TRPCError } from "@trpc/server"
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TDictionary } from "./langs"
import { logger } from "./logger"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ApiError(message: string, code?: TRPC_ERROR_CODE_KEY): never {
  throw new TRPCError({
    code: code ?? "BAD_REQUEST",
    message: message,
  })
}

/**
 * Get the time between to dates
 * @param firstDate First date
 * @param secondDate Second date
 * @returns The time between the two dates
 * @example
 * getTimeBetween(new Date("2020-01-01"), new Date("2020-01-02")) // 1 day
 */
export const getTimeBetween = (
  firstDate: Date,
  secondDate: Date,
  options?: {
    markAsNowSince?: number
  }
) => {
  // Time difference in milliseconds
  const timeDiff = Math.abs(firstDate.getTime() - secondDate.getTime()) // in milliseconds

  // Check for the markAsNowSince
  const markAsNowSince = options?.markAsNowSince || 1000 * 60
  if (timeDiff < markAsNowSince) {
    return "now"
  }

  // Define time intervals in milliseconds
  const intervals = {
    year: 365.25 * 24 * 60 * 60 * 1000,
    month: 30.44 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
  }
  // Calculate the number of intervals elapsed
  const elapsed = {
    year: Math.floor(timeDiff / intervals.year),
    month: Math.floor(timeDiff / intervals.month),
    day: Math.floor(timeDiff / intervals.day),
    hour: Math.floor(timeDiff / intervals.hour),
    minute: Math.floor(timeDiff / intervals.minute),
    second: Math.floor(timeDiff / intervals.second),
  }
  // Determine the appropriate time interval to display
  let timeUnit
  let timeValue
  if (elapsed.year > 0) {
    timeUnit = "year"
    timeValue = elapsed.year
  } else if (elapsed.month > 0) {
    timeUnit = "month"
    timeValue = elapsed.month
  } else if (elapsed.day > 0) {
    timeUnit = "day"
    timeValue = elapsed.day
  } else if (elapsed.hour > 0) {
    timeUnit = "hour"
    timeValue = elapsed.hour
  } else if (elapsed.minute > 0) {
    timeUnit = "minute"
    timeValue = elapsed.minute
  } else {
    timeUnit = "second"
    timeValue = elapsed.second
  }
  // Construct and return the time elapsed string
  return `${timeValue} ${timeUnit}${timeValue !== 1 ? "s" : ""}`
}

// Function to ensure an url is relative to the current domain
export const ensureRelativeUrl = (url: string | undefined) => {
  if (url && url.startsWith("http")) {
    const urlObject = new URL(url)
    return urlObject.pathname
  }
  return url
}

export const formatCouldNotMessage = async ({
  couldNotMessage,
  action,
  subject,
}: {
  couldNotMessage: string
  action: string
  subject: string
}) => {
  return couldNotMessage.replace("{action}", action).replace("{subject}", subject)
}

export const translateError = (error: string, dictionary: TDictionary) => {
  if (error === "Email already exists") {
    return dictionary.errors.email.exist
  } else if (error === "Username already exists") {
    return dictionary.errors.username.exist
  }
  logger.error("Unknown translation for:", error)
  return error
}
