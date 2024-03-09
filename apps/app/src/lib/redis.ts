import Redis, { RedisOptions } from "ioredis"

const options: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_USE_TLS === "true" ? {} : undefined,
}

export const redis = new Redis(options)
