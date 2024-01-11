import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import Negotiator from "negotiator"

import { match as matchLocale } from "@formatjs/intl-localematcher"

import { i18n } from "../i18n-config"

const blackListedPaths = ["healthz", "api/healthz", "health", "ping", "api/ping"]

function getLocale(request: NextRequest): string | undefined {
  const cookies = request.cookies
  const savedLocale = cookies.get("saved-locale")
  if (savedLocale?.value) return savedLocale.value

  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const locales: string[] = i18n.locales as unknown as string[]

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales)

  const locale = matchLocale(languages, locales, i18n.defaultLocale)

  return locale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // If you have one
  if (
    [
      "/favicon.ico",
      // Your other files in `public`
    ].includes(pathname)
  )
    return

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )
  if (!pathnameIsMissingLocale) {
    const localeInPathname =
      i18n.locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) || ""
    const presentLocale = getLocale(request) || i18n.defaultLocale
    const response = NextResponse.next()
    if (localeInPathname !== presentLocale) {
      response.cookies.set("saved-locale", localeInPathname, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    }
    return response
  }

  const pathnameIsNotBlacklisted = !blackListedPaths.some((path) => pathname.startsWith(`/${path}`))

  // Redirect if there is no locale
  if (pathnameIsNotBlacklisted) {
    const locale = getLocale(request)

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    const params = new URLSearchParams(request.nextUrl.search)
    const redirectUrl = new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}?${params}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
