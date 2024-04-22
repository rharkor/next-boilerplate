import { TDictionary } from "@/lib/langs"

export const rolesAsObject = {
  admin: "ADMIN",
  user: "USER",
} as const

export const appTitle = (dictionary: TDictionary<{ app: { name: true } }>) => dictionary.app.name
export const appDescription = (dictionary: TDictionary<{ app: { description: true } }>) => dictionary.app.description

export const resetPasswordExpiration = 1000 * 60 * 60 * 24 // 24 hours
export const resendResetPasswordExpiration = 1000 * 60 * 5 // 5 minutes
export const emailVerificationExpiration = 1000 * 60 * 60 * 24 * 3 // 3 days
export const resendEmailVerificationExpiration = 1000 * 60 * 2 // 5 minutes
export const defaultMaxPerPage = 100
export const maxUploadSize = 1024 * 1024 * 10 // 10 MB

export const otpWindow = 1

export const lastLocaleExpirationInSeconds = 60 * 60 * 24 * 30 // 30 days
