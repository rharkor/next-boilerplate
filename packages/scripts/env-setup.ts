/**
 * This script will initialize the environment variables and the db
 */

import chalk from "chalk"
import { exec } from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootDir = path.join(__dirname, "..", "..")
export const envSetup = async () => {
  //* Copy the .env.example to .env for
  // App
  const appEnvPath = path.join(rootDir, "packages", "app", ".env")
  if (!fs.existsSync(appEnvPath)) {
    fs.copyFileSync(path.join(rootDir, "packages", "app", ".env.example"), appEnvPath)
    console.log(chalk.green("Created .env for app"))
  } else console.log(chalk.yellow("Skipping .env for app"))
  // Landing
  const landingEnvPath = path.join(rootDir, "packages", "landing", ".env")
  if (!fs.existsSync(landingEnvPath)) {
    fs.copyFileSync(path.join(rootDir, "packages", "landing", ".env.example"), landingEnvPath)
    console.log(chalk.green("Created .env for landing"))
  } else console.log(chalk.yellow("Skipping .env for landing"))

  //* Initialize the database
  const appPath = path.join(rootDir, "packages", "app")
  console.log(chalk.blue("Initializing the database..."))
  await new Promise<void>((resolve, reject) => {
    exec("npx prisma migrate dev && npm run seed", { cwd: appPath }, (err, stdout, stderr) => {
      if (err) {
        console.log(chalk.red(err.message))
        reject(err)
      }
      if (stderr) {
        console.log(chalk.red(stderr))
        reject(stderr)
      }
      resolve()
    })
  })
}
