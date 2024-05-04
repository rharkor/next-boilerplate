import { config } from "dotenv"
import * as fs from "fs/promises"
import { exit } from "node:process"
import * as path from "path"
import * as url from "url"

import { codingEnv } from "./coding-env"
import { completeInitialisation } from "./complete-initialisation"
import { dbSetup } from "./db-setup"
import { envSetup } from "./env-setup"
import { modulesSelection } from "./modules-selection"
import { packagesSelection } from "./packages-selection"
import { replaceTokens } from "./replace-tokens"
import { startupRequirements } from "./startup-requirements"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

config()

async function main() {
  const alreadyInitialized = await fs
    .access(path.join(rootPath, "scripts", ".init-todo"))
    .then(() => false)
    .catch(() => true)

  await startupRequirements()
  await envSetup()

  if (!alreadyInitialized) {
    await modulesSelection()
    await replaceTokens()
    await packagesSelection()
  }

  await dbSetup()
  await codingEnv()
  await completeInitialisation()

  exit(0)
}

main()
