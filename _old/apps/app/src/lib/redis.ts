import Redis, { RedisOptions } from "ioredis"

import { env } from "./env"

const options: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
  tls: env.REDIS_USE_TLS ? {} : undefined,
}

export const redis = new Redis(options)
