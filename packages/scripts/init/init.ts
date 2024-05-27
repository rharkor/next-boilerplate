import { config } from "dotenv"
import * as fs from "fs/promises"
import { exit } from "node:process"
import * as path from "path"

import { getPath } from "./utils/path"
import { codingEnv } from "./coding-env"
import { completeInitialisation } from "./complete-initialisation"
import { dbSetup } from "./db-setup"
import { envSetup } from "./env-setup"
import { modulesSelection } from "./modules-selection"
import { packagesSelection } from "./packages-selection"
import { replaceTokens } from "./replace-tokens"

config()

async function main() {
  const alreadyInitialized = await fs
    .access(path.join(getPath(), "packages", "scripts", ".init-todo"))
    .then(() => false)
    .catch(() => true)

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
