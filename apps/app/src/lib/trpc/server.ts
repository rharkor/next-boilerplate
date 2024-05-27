import { redirect } from "next/navigation"

import { authRoutes } from "@/constants/auth"
import { logger } from "@next-boilerplate/lib"
import { TRPCError } from "@trpc/server"

import { appRouter } from "../../api/_app"
import { createCallerFactory } from "../server/trpc"
import { TErrorMessage } from "../utils/server-utils"

import { createContext } from "./context"

/**
 * This client invokes procedures directly on the server without fetching over HTTP.
 */
const _serverTrpc = createCallerFactory(appRouter)(createContext(undefined, true))

type RecursiveProxy = {
  [key: string]: RecursiveProxy
  (): void
}

function noop() {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolvePath(obj: any, path: string[]): any {
  return path.reduce((currentObject, key) => currentObject?.[key], obj)
}

function createRecursiveProxy(path: string[] = []): RecursiveProxy {
  return new Proxy(noop, {
    get(target, prop, receiver) {
      if (typeof prop === "string") {
        return createRecursiveProxy([...path, prop])
      }
      return Reflect.get(target, prop, receiver)
    },
    apply(target, thisArg, args) {
      //* Call the server trpc function
      return handleServerError(resolvePath(_serverTrpc, path)(...args), {
        path,
      })
    },
  }) as RecursiveProxy
}

export const serverTrpc = createRecursiveProxy() as unknown as typeof _serverTrpc

export const handleServerError = async <T>(
  promise: Promise<T>,
  {
    path,
  }: {
    path: string[]
  }
): Promise<T> => {
  try {
    return await promise
  } catch (error) {
    //? if error code is NEXT_REDIRECT
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }
    if (error instanceof TRPCError) {
      try {
        const data = JSON.parse(error.message) as TErrorMessage | string
        if (error.code === "UNAUTHORIZED") {
          if (typeof data !== "string") {
            const avoidRedirect = data.extra && "redirect" in data.extra && data.extra.redirect === false
            if (!avoidRedirect) {
              redirect(authRoutes.redirectOnUnhauthorized)
            }
          }
        } else if (typeof data !== "string") {
          const redirectUrl =
            data.extra && "redirect" in data.extra && data.extra.redirect && typeof data.extra.redirect === "string"
              ? data.extra.redirect
              : undefined
          if (redirectUrl) {
            redirect(redirectUrl)
          }
        }
      } catch (e) {
        if (e instanceof Error && e.message === "NEXT_REDIRECT") {
          throw e
        }
      }
      if (error.code === "UNAUTHORIZED") {
        redirect(authRoutes.redirectOnUnhauthorized)
      }
    }
    logger.error(error, path.join("."))
    const errorOutput: { [key: string]: unknown } = {
      raw: error,
    }
    if (error instanceof Error) {
      errorOutput.message = error.message
      errorOutput.name = error.name
      errorOutput.stack = error.stack
    }
    if (typeof error === "string") {
      try {
        const errorJsonParsed = JSON.parse(error)
        errorOutput.json = errorJsonParsed
      } catch (e) {}
    }
    throw error
  }
}
