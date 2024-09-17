/**
 * Validate the config of each templates
 */

import minimist from "minimist"
import path from "path"
import { fileURLToPath } from "url"

import { input } from "@inquirer/prompts"
import { applyConfigurationTask } from "@next-boilerplate/cli-helpers/apply"

// Get the current package directory
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory
const dir = path.resolve(__dirname, "../../..")

const assetsDirectory = path.join(dir, "assets")

const argv = minimist(process.argv.slice(2))

export const applyConfig = async () => {
  //* Root dir
  let root = argv.root as string
  if (!root) {
    try {
      root = await input({
        message: "What is the root directory?",
        default: ".",
      })
    } catch {
      process.exit(0)
    }
  }

  await applyConfigurationTask({
    assetsDirectory,
    root,
    noTask: false,
  }).catch(() => {
    process.exit(1)
  })
}
