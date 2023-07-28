import { hash as bhash, compare } from "bcryptjs"
import crypto from "crypto-js"
import { env } from "env.mjs"

const PASSWORD_HASHER_SECRET = env.PASSWORD_HASHER_SECRET

export const hash = async (value: string, saltOrRounds: string | number) => {
  const preHashed = crypto.HmacSHA256(value, PASSWORD_HASHER_SECRET).toString()
  return await bhash(preHashed, saltOrRounds)
}

export const bcryptCompare = async (value: string, hash: string) => {
  const preHashed = crypto.HmacSHA256(value, PASSWORD_HASHER_SECRET).toString()
  return compare(preHashed, hash)
}
