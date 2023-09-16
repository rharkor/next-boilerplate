//! HERE WE ONLY USE INDIVIUAL CRON JOBS
//? global cron job are not handled here but in the global project

import { CronJob } from "cron"
import { config } from "dotenv"
config()

//? Do a task every day
new CronJob(
  "0 0 * * *",
  () => {
    //? Do something
  },
  null,
  true,
  "Europe/Paris"
)
