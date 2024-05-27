/**
 * This script will initialize the db
 */

import * as fs from "fs"
import * as path from "path"

import { exec } from "./utils/cmd"
import { getPath } from "./utils/path"

const rootDir = getPath()

export const dbSetup = async () => {
  //* Initialize the database
  const appPath = path.join(rootDir, "apps", "app")
  if (!(!fs.existsSync(appPath) || !fs.existsSync(path.join(appPath, "prisma")))) {
    //? Prisma command exists
    try {
      await exec("npx --yes prisma --version", {
        cwd: appPath,
        successMessage: "Prisma is installed",
        name: "Checking if prisma is installed",
      })
    } catch {
      await exec("npm i -g prisma", {
        cwd: appPath,
        successMessage: "Prisma is installed",
        name: "Installing prisma",
      })
    }

    //? Prisma migrate dev
    await exec("prisma migrate deploy", {
      cwd: appPath,
      successMessage: "Database migrated",
      name: "Migrating the database",
    }).catch(() => {})

    //? Prisma seed
    await exec("prisma db seed", {
      cwd: appPath,
      successMessage: "Database seeded",
      name: "Seeding the database",
    })
  }
}
