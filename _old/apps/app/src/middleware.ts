import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import Negotiator from "negotiator"

import { i18n } from "@/lib/i18n-config"
import { match as matchLocale } from "@formatjs/intl-localematcher"

const blackListedPaths = ["healthz", "api/healthz", "health", "ping", "api/ping"]

function getLocale(request: NextRequest, cookiesLocale: string | undefined): string | undefined {
  if (cookiesLocale) return cookiesLocale
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

  // Inject the current url in the headers
  const rHeaders = new Headers(request.headers)
  rHeaders.set("x-url", request.url)

  // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // If you have one
  if (
    [
      "/favicon.ico",
      "/favicon.webp",
      "/robots.txt",
      "/sitemap.xml",
      // Your other files in `public`
    ].includes(pathname) ||
    pathname.match(/^\/[a-z]+\/_next$/)
  )
    return

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  const cookies = request.cookies
  const savedLocale = cookies.get("saved-locale")
  const cookiesLocales = savedLocale?.value

  if (!pathnameIsMissingLocale) {
    const localeInPathname =
      i18n.locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) || ""
    const response = NextResponse.next({
      request: {
        headers: rHeaders,
      },
    })
    if (localeInPathname !== cookiesLocales) {
      response.cookies.set("saved-locale", localeInPathname, {
        path: "/",
        sameSite: "lax",
        // eslint-disable-next-line no-process-env
        secure: process.env.NODE_ENV === "production",
      })
    }
    return response
  }

  const pathnameIsNotBlacklisted = !blackListedPaths.some((path) => pathname.startsWith(`/${path}`))

  // Redirect if there is no locale
  if (pathnameIsNotBlacklisted) {
    const locale = getLocale(request, cookiesLocales)

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    const params = new URLSearchParams(request.nextUrl.search)
    const redirectUrl = new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}?${params}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next({
    request: {
      headers: rHeaders,
    },
  })
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
