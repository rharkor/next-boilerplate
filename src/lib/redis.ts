import Redis, { RedisOptions } from "ioredis"
import { env } from "env.mjs"

const options: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
}

const redisUrl = env.REDIS_URL ?? `redis://${options.username}:${options.password}@${options.host}:${options.port}`

export const redis = new Redis(redisUrl)
