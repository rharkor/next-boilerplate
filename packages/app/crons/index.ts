//! HERE WE ONLY USE INDIVIUAL CRON JOBS
//? Global cron jobs need to be handle in their own package.
// Exemple: If you're using a cron job to send a newsletter,
// you should not handle it here unless you are sure that it will be only one instance of the app.

//** UNCOMMENT THIS TO USE CRON JOBS */
/*
import { CronJob } from "cron"
import { config } from "dotenv"

import { logger } from "@lib/logger"
config()

//? Do a task every day

new CronJob(
  "0 0 * * *",
  async () => {
    const maxDurationWarning = 1000 * 60 * 5 // 5 minutes
    const name = "CronName"
    const now = new Date()
    //? Do something
    async function something() {}
    await something().catch((err) => {
      logger.error(
        `[${now.toLocaleString()}] ${name} started at ${now.toLocaleString()} and failed after ${
          new Date().getTime() - now.getTime()
        }ms`
      )
      throw err
    })
    const took = new Date().getTime() - now.getTime()
    if (took > maxDurationWarning) logger.warn(`[${now.toLocaleString()}] ${name} took ${took}ms`)
  },
  null,
  true,
  "Europe/Paris"
)
*/
