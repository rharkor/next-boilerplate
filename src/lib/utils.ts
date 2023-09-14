import { TRPCClientErrorLike } from "@trpc/client"
import { TRPCError } from "@trpc/server"
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc"
import { type ClassValue, clsx } from "clsx"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"
import { twMerge } from "tailwind-merge"
import { authRoutes } from "./auth/constants"
import { TDictionary } from "./langs"
import { logger } from "./logger"
import { AppRouter } from "./server/routers/_app"

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

export const throwableErrorsMessages = {
  emailAlreadyExists: "Email already exists",
  usernameAlreadyExists: "Username already exists",
  cannotDeleteAdmin: "You cannot delete the admin account",
  accountAlreadyExists: "Account already exists",
  youAreNotLoggedIn: "You are not logged in",
  unknownError: "Unknown error",
  userNotFound: "User not found",
} as const

//? Verify no duplicate values
if (Object.values(throwableErrorsMessages).length !== new Set(Object.values(throwableErrorsMessages)).size) {
  throw new Error("Duplicate values in throwableErrorsMessages")
}

export const translateError = (error: string, dictionary: TDictionary): string => {
  switch (error) {
    case throwableErrorsMessages.emailAlreadyExists:
      return dictionary.errors.email.exist
    case throwableErrorsMessages.usernameAlreadyExists:
      return dictionary.errors.username.exist
    case throwableErrorsMessages.cannotDeleteAdmin:
      return dictionary.errors.cannotDeleteAdmin
    case throwableErrorsMessages.accountAlreadyExists:
      return dictionary.errors.accountAlreadyExists
    case throwableErrorsMessages.youAreNotLoggedIn:
      return dictionary.errors.unauthorized
    case throwableErrorsMessages.unknownError:
      return dictionary.errors.unknownError
    case throwableErrorsMessages.userNotFound:
      return dictionary.errors.userNotFound
    default:
      logger.error("Unknown translation for:", error)
      return error
  }
}

export const handleApiError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary,
  router: AppRouterInstance
): T => {
  if (error.data?.code === "UNAUTHORIZED") {
    router.push(authRoutes.redirectOnUnhauthorized)
    const errorMessage = dictionary.errors.unauthorized
    return {
      ...error,
      message: errorMessage,
    }
  }

  const translatedError = translateError(error.message, dictionary)
  return {
    ...error,
    message: translatedError,
  }
}
