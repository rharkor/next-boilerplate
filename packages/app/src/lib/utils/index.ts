import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { logger } from "@lib/logger"
import { TRPCClientErrorLike } from "@trpc/client"

import { AppRouter } from "../../api/_app"
import { authRoutes } from "../auth/constants"
import { TDictionary } from "../langs"

import { TErrorMessage } from "./server-utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  options: {
    markAsNowSince?: number
    dictionary: TDictionary
  }
) => {
  // Time difference in milliseconds
  const timeDiff = Math.abs(firstDate.getTime() - secondDate.getTime()) // in milliseconds

  // Check for the markAsNowSince
  const markAsNowSince = options.markAsNowSince || 1000 * 60
  if (timeDiff < markAsNowSince) {
    return options.dictionary.timeUnit.now
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
    timeUnit = elapsed.year > 1 ? options.dictionary.timeUnit.years : options.dictionary.timeUnit.year
    timeValue = elapsed.year
  } else if (elapsed.month > 0) {
    timeUnit = elapsed.month > 1 ? options.dictionary.timeUnit.months : options.dictionary.timeUnit.month
    timeValue = elapsed.month
  } else if (elapsed.day > 0) {
    timeUnit = elapsed.day > 1 ? options.dictionary.timeUnit.days : options.dictionary.timeUnit.day
    timeValue = elapsed.day
  } else if (elapsed.hour > 0) {
    timeUnit = elapsed.hour > 1 ? options.dictionary.timeUnit.hours : options.dictionary.timeUnit.hour
    timeValue = elapsed.hour
  } else if (elapsed.minute > 0) {
    timeUnit = elapsed.minute > 1 ? options.dictionary.timeUnit.minutes : options.dictionary.timeUnit.minute
    timeValue = elapsed.minute
  } else {
    timeUnit = elapsed.second > 1 ? options.dictionary.timeUnit.seconds : options.dictionary.timeUnit.second
    timeValue = elapsed.second
  }
  // Construct and return the time elapsed string
  return `${timeValue} ${timeUnit}`
}

// Function to ensure an url is relative to the current domain
export const ensureRelativeUrl = <T extends string | undefined>(url: T) => {
  if (url && url.startsWith("http")) {
    const urlObject = new URL(url)
    return urlObject.pathname
  }
  return url as T
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

type TDictKey = { [key: string]: TDictKey } | undefined | string
export const findNestedKeyInDictionary = (key: string, dictionaryErrors: TDictionary["errors"]): string | undefined => {
  const keys = key.split(".")
  let currentKey = keys.shift()
  let currentObject: TDictKey = dictionaryErrors
  while (currentKey && currentObject && typeof currentObject === "object") {
    currentObject = currentObject[currentKey]
    currentKey = keys.shift()
  }
  return currentObject as string | undefined
}

export const translateError = (error: string, dictionary: TDictionary): string => {
  const errorTranslated = findNestedKeyInDictionary(error, dictionary.errors)
  if (!errorTranslated) {
    logger.error(new Error(`Error not found in dictionary: ${error}`))
    return dictionary.errors.unknownError
  }
  return errorTranslated.toString()
}

export const handleApiError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance
): T => {
  try {
    const parsedError = JSON.parse(error.message) as TErrorMessage | string
    if (typeof parsedError === "string") {
      const translatedError = translateError(error.message, dictionary)
      if (error.data?.code === "UNAUTHORIZED") {
        router.push(authRoutes.redirectOnUnhauthorized)
      }
      return {
        ...error,
        message: translatedError,
      }
    }

    const translatedError = translateError(parsedError.message, dictionary)
    const avoidRedirect = parsedError.extra && "redirect" in parsedError.extra && parsedError.extra.redirect === false
    if (error.data?.code === "UNAUTHORIZED" && !avoidRedirect) {
      router.push(authRoutes.redirectOnUnhauthorized)
    }

    return {
      ...error,
      message: translatedError,
    }
  } catch (e) {
    const translatedError = dictionary.errors.unknownError
    return {
      ...error,
      message: translatedError,
    }
  }
}

export function bytesToMegabytes(bytes: number, round?: boolean): number {
  const megabytes = bytes / (1024 * 1024)
  if (round) return Math.round(megabytes * 100) / 100
  return megabytes
}

export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = []

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }

  return result
}

export function stringToSlug(string: string): string {
  return string
    .toLowerCase()
    .replace(/[^\w -]+/g, "")
    .replace(/ +/g, "-")
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
