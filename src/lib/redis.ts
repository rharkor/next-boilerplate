import Redis, { RedisOptions } from "ioredis"
import { env } from "env.mjs"

const options: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
}

console.log("Options", options)
export const redis = new Redis(options)
