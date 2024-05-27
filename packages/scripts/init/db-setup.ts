/**
 * This script will initialize the db
 */

import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

import { startTask } from "@next-boilerplate/lib"

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
    try {
      execSync("prisma migrate deploy", { cwd: appPath })
    } catch {
      task.print("Prisma migrate dev failed, please run it by yourself...")
    }
    task.stop()

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
