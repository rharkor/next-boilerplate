import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import Negotiator from "negotiator"

import { i18n } from "@/lib/i18n-config"
import { match as matchLocale } from "@formatjs/intl-localematcher"

import { savedLocaleCookieName } from "./constants"

/**
 * Set the default locale based on the request headers if no locale is set in the cookies
 * @param request
 * @param response
 * @returns
 */
function setDefaultLocale(request: NextRequest, response: NextResponse) {
  const cookies = request.cookies
  const savedLocale = cookies.get(savedLocaleCookieName)
  const cookiesLocales = savedLocale?.value
  // Match the locale from the cookies
  if (cookiesLocales && i18n.locales.includes(cookiesLocales)) {
    return
  }
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const locales: string[] = i18n.locales as unknown as string[]

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales)

  const locale = matchLocale(languages, locales, i18n.defaultLocale)
  // Assign the locale to the response
  response.cookies.set(savedLocaleCookieName, locale, {
    path: "/",
    sameSite: "lax",
    // eslint-disable-next-line no-process-env
    secure: process.env.NODE_ENV === "production",
  })
}

export function middleware(request: NextRequest) {
  // Inject the current url in the headers
  const headers = new Headers(request.headers)
  headers.set("x-url", request.url)

  const response = NextResponse.next({
    headers,
  })
  setDefaultLocale(request, response)

  return response
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
