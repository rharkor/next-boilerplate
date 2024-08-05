#!/usr/bin/env zx

/**
 * Validate the config of each templates
 */

import { z } from "zod"
import { $ } from "zx"

import { input } from "@inquirer/prompts"
import { logger, task } from "@rharkor/logger"

import "zx/globals"

const dir = $.sync`pwd`.text().replace("\n", "")

const componentsDirectory = path.join(dir, "assets", "components")
const configFileName = "config.json"

const configSchema = z.object({
  name: z.string(),
  references: z.record(z.string(), z.string()),
})
type TConfig = z.infer<typeof configSchema>

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

  const applyConfigTask = await task.startTask({
    name: "Apply template config... 🧰",
  })

  //* Retrieve config
  applyConfigTask.print("Retrieving the config")
  const configPath = !root.endsWith(configFileName) ? path.join(root, configFileName) : root
  if (!(await fs.exists(configPath))) {
    applyConfigTask.error(`The config file ${configPath} doesn't exist`)
    applyConfigTask.stop()
    process.exit(1)
  }

  const config = (await fs.readJson(configPath)) as TConfig
  try {
    configSchema.parse(config)
  } catch (error) {
    applyConfigTask.error(`The config file ${configPath} is not valid`)
    applyConfigTask.stop()
    logger.error(error)
    process.exit(1)
  }

  //* Apply references
  applyConfigTask.print("Applying references")

  // Diff the checksum of the directories/files and apply the changes
  const applyCompareChecksum = async (fromPath: string, toPath: string) => {
    const isDirectory = await fs.stat(fromPath).then((stat) => stat.isDirectory())

    if (isDirectory) {
      const fromChecksum = await $`find ${fromPath} -type f -exec md5sum {} \\;`.text()
      const toChecksum = await $`find ${toPath} -type f -exec md5sum {} \\;`.text()

      if (fromChecksum !== toChecksum) {
        applyConfigTask.print(`Copying the directory ${fromPath} to the component ${toPath}`)
        await fs.copy(fromPath, toPath, { overwrite: true })
      }
    } else {
      const fromChecksum = await $`md5sum ${fromPath}`.text()
      const toChecksum = await $`md5sum ${toPath}`.text()

      if (fromChecksum !== toChecksum) {
        applyConfigTask.print(`Copying the file ${fromPath} to the component ${toPath}`)
        await fs.copy(fromPath, toPath)
      }
    }
  }

  for (const [from, to] of Object.entries(config.references)) {
    //? Check if the component exists
    const toDirPath = path.join(componentsDirectory, to)
    // Find the file that start with "index"
    const toPathFile = (await fs.readdir(toDirPath)).find((file) => file.startsWith("index"))
    const toPath = toPathFile ? path.join(toDirPath, toPathFile) : undefined
    if (!toPath || !(await fs.exists(toPath))) {
      applyConfigTask.error(`The component ${to} referenced by the config doesn't exist`)
      continue
    }

    // Verify if the template from is up to date
    const fromPath = path.join(root, from)
    if (!(await fs.exists(fromPath))) {
      applyConfigTask.print(`Copying the component ${to} to ${fromPath}`)
      await fs.copy(toPath, fromPath)
    } else {
      // Compare the checksum
      await applyCompareChecksum(toPath, fromPath)
    }
  }

  applyConfigTask.stop("The template config has been applied! 🎉")
}
