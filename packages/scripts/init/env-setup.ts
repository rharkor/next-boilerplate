/**
 * This script will initialize the environment variables
 */

import * as fs from "fs"
import { join } from "path"

import { startTask } from "@next-boilerplate/lib"

import { getPath } from "./utils/path"

export const envSetup = async () => {
  const task = startTask({
    name: "Setting up environment variables",
    successMessage: "Environment variables setup",
  })
  //* Copy the .env.example to .env for
  // App
  const appPath = getPath("apps", "app")
  const appEnvPath = join(appPath, ".env")
  const appEnvExamplePath = join(appPath, ".env.example")
  if (!fs.existsSync(appEnvPath) && fs.existsSync(appEnvExamplePath)) {
    fs.copyFileSync(appEnvExamplePath, appEnvPath)
    task.print("Created .env for app")
  } else task.print("Skipping .env for app")

  // Landing
  const landingPath = getPath("apps", "landing")
  const landingEnvPath = join(landingPath, ".env")
  const landingEnvExamplePath = join(landingPath, ".env.example")
  if (!fs.existsSync(landingEnvPath) && fs.existsSync(landingEnvExamplePath)) {
    fs.copyFileSync(landingEnvExamplePath, landingEnvPath)
    task.print("Created .env for landing")
  } else task.print("Skipping .env for landing")

  // Cron
  const cronPath = getPath("apps", "cron")
  const cronEnvPath = join(cronPath, ".env")
  const cronEnvExamplePath = join(cronPath, ".env.example")
  if (!fs.existsSync(cronEnvPath) && fs.existsSync(cronEnvExamplePath)) {
    fs.copyFileSync(cronEnvExamplePath, cronEnvPath)
    task.print("Created .env for cron")
  } else task.print("Skipping .env for cron")

  task.stop()
}
