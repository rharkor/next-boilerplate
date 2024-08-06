import { TDictionary } from "@/lib/langs"

export const appTitle = (dictionary: TDictionary<{ app: { name: true } }>) => dictionary.app.name
export const appDescription = (dictionary: TDictionary<{ app: { description: true } }>) => dictionary.app.description

export const defaultMaxPerPage = 100
export const maxUploadSize = 1024 * 1024 * 10 // 10 MB

export const lastLocaleExpirationInSeconds = 60 * 60 * 24 * 30 // 30 days
