import Redis, { ChainableCommander, RedisOptions } from "ioredis"

import { logger } from "@lib/logger"

const options: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_USE_TLS === "true" ? {} : undefined,
}

export const redis = new Redis(options)

export const redisKeyUtils = {}

export const redisGetSert = async <T>(
  keyInfo: {
    key: string
    groups?: string[] | ((value: Awaited<T>) => string[])
  },
  callback: () => T,
  options: {
    expiration?: number
    logWhenCached?: boolean
    disableSWR?: boolean
  } = {
    expiration: undefined,
    logWhenCached: false,
    disableSWR: false,
  }
): Promise<T> => {
  const value = await redis.get(keyInfo.key)
  const executeCallback = async () => {
    const callbackValue = typeof callback === "function" ? await callback() : callback
    await redis.set(keyInfo.key, JSON.stringify(callbackValue), "EX", options.expiration ?? 60 * 5)
    if (keyInfo.groups) {
      if (typeof keyInfo.groups === "function") await redis.sadd("group_" + keyInfo.groups(callbackValue), keyInfo.key)
      else
        for (const group of keyInfo.groups) {
          await redis.sadd("group_" + group, keyInfo.key)
        }
    }
    return callbackValue
  }
  if (value) {
    if (options.logWhenCached) logger.log("Redis value retrieved. key:", keyInfo.key, " value:", value)
    if (!options.disableSWR) executeCallback()
    return JSON.parse(value) as T
  }
  return executeCallback()
}

export const redisDelete = async (
  groupOrKey: string | string[],
  pipeline?: ChainableCommander,
  {
    forceExec,
  }: {
    forceExec?: boolean
  } = {}
) => {
  const redisPipeline = pipeline ?? redis.pipeline()
  if (Array.isArray(groupOrKey)) {
    await Promise.all(
      groupOrKey.map(async (key) =>
        redisDelete(key, redisPipeline, {
          forceExec: true,
        })
      )
    )
    return
  }
  const keys = await redis.smembers("group_" + groupOrKey)
  redisPipeline.del(...keys)
  redisPipeline.del(groupOrKey)

  if (forceExec || !pipeline) await redisPipeline.exec()
}
