import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { authRoutes } from "@/constants/auth"
import { PickFromSubset, SelectSubset } from "@/types"
import { TRPCClientErrorLike } from "@trpc/client"

import { AppRouter } from "../../api/_app"
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
    dictionary: TDictionary<{
      timeUnit: true
    }>
  }
): string => {
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
export const findNestedKeyInDictionary = (
  key: string,
  dictionaryErrors: TDictionary<undefined, "errors">
): string | undefined => {
  const keys = key.split(".")
  let currentKey = keys.shift()
  let currentObject: TDictKey = dictionaryErrors
  while (currentKey && currentObject && typeof currentObject === "object") {
    currentObject = currentObject[currentKey]
    currentKey = keys.shift()
  }
  return currentObject as string | undefined
}

export const handleApiError = <T extends TRPCClientErrorLike<AppRouter>>(
  error: T,
  dictionary: TDictionary<{
    unknownError: true
  }>,
  router: AppRouterInstance
): T => {
  try {
    const parsedError = JSON.parse(error.message) as TErrorMessage | string
    if (typeof parsedError === "string") {
      const translatedError = parsedError
      if (error.data?.code === "UNAUTHORIZED") {
        router.push(authRoutes.redirectOnUnhauthorized)
      }
      return {
        ...error,
        message: translatedError,
      }
    }

    const translatedError = parsedError.message
    const avoidRedirect = parsedError.extra && "redirect" in parsedError.extra && parsedError.extra.redirect === false
    if (error.data?.code === "UNAUTHORIZED" && !avoidRedirect) {
      router.push(authRoutes.redirectOnUnhauthorized)
    }

    return {
      ...error,
      message: translatedError,
    }
  } catch (e) {
    const translatedError = dictionary.unknownError
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

export function stringToSlug(string: string): string {
  return string
    .toLowerCase()
    .replace(/[^\w -]+/g, "")
    .replace(/ +/g, "-")
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pickFromSubset<T extends object, K extends SelectSubset<T>>(
  obj: T,
  subset: K,
  keySum?: string
): PickFromSubset<T, K> {
  const result = {} as PickFromSubset<T, K>
  if (!subset) {
    // throw new Error("The subset is undefined. Please provide a subset to pick from the dictionary.")
    return obj as PickFromSubset<T, K>
  }
  Object.keys(subset).forEach((_key) => {
    const key = _key as keyof typeof subset
    if (!obj[key as keyof T]) {
      throw new Error(
        `The key "${(keySum ? keySum + "." : "") + key.toString()}" not found in dictionary. Maybe you forgot to import it from the server component. see the docs for more information.`
      )
    }
    if (subset[key] === true) {
      result[key] = obj[key as keyof T] as PickFromSubset<T, K>[keyof K]
    } else if (typeof subset[key] === "object") {
      result[key] = pickFromSubset(
        obj[key as keyof T] as object,
        subset[key] as SelectSubset<T[keyof T]>,
        keySum ? keySum + "." + key.toString() : key.toString()
      ) as PickFromSubset<T, K>[keyof K]
    }
  })
  return result
}

export function isObject(item: unknown) {
  return item && typeof item === "object" && !Array.isArray(item)
}

export function merge<T extends object, R extends object[]>(target: T, ...sources: R): T & R[number] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isObject = (obj: any): obj is object => !!obj && typeof obj === "object" && !Array.isArray(obj)

  const mergeTwo = <T extends object, K extends object>(target: T, source: K): T & K => {
    if ((target as T | boolean) === true) return true as unknown as T & K
    const output = { ...target }
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((_key) => {
        const key = _key as keyof typeof source
        if (isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] })
          else
            output[key as unknown as keyof T] = mergeTwo(
              target[key as unknown as keyof T] as object,
              source[key] as object
            ) as T[keyof T]
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }
    return output as T & K
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return sources.reduce((acc, curr) => mergeTwo(acc, curr as any), target) as T
}
