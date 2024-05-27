/**
 * This script will initialize the db
 */

import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

import { logger, startTask } from "@next-boilerplate/lib"

import { getPath } from "./utils/path"

const rootDir = getPath()

export const dbSetup = async () => {
  //* Initialize the database
  const appPath = path.join(rootDir, "apps", "app")
  if (!(!fs.existsSync(appPath) || !fs.existsSync(path.join(appPath, "prisma")))) {
    const task = startTask({
      name: "Database setup",
      successMessage: "Database setup completed",
    })
    //? Prisma command exists
    try {
      task.print("Checking if prisma is installed...")
      execSync("npx --yes prisma --version", { cwd: appPath })
    } catch {
      task.print("Prisma is not installed")
      task.print("Installing prisma...")
      execSync("npm i -g prisma", { cwd: appPath })
    }

    //? Prisma migrate dev
    task.print("Migrating the database...")
    let hasError = false
    try {
      execSync("prisma migrate dev", { cwd: appPath })
    } catch {
      hasError = true
    }
    task.stop()
    if (hasError) logger.error("Prisma migrate dev failed, please run it by yourself...")

    //? Prisma seed
    const seedTask = startTask({
      name: "Database seeding",
      successMessage: "Database seeding completed",
    })
    task.print("Seeding the database...")
    try {
      execSync("prisma db seed", { cwd: appPath })
    } catch {
      task.print("Prisma db seed failed, please run it by yourself...")
    }
    seedTask.stop()
  }
}
