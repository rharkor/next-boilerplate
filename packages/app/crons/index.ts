//! HERE WE ONLY USE INDIVIUAL CRON JOBS
//? global cron job are not handled here but in the global project

import { config } from "dotenv"
config()

//? Do a task every day
// new CronJob(
//   "0 0 * * *",
//   () => {
// const now = new Date()
// logger.info(`[${now.toLocaleString()}] Doing something every day`)
//? Do something
// const took = new Date().getTime() - now.getTime()
// logger.info(`[${now.toLocaleString()}] Doing something every day took ${took}ms`)
//   },
//   null,
//   true,
//   "Europe/Paris"
// )
