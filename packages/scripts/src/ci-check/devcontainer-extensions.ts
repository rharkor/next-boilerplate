#!/usr/bin/env zx

/**
 * Ensure that the exentions specified in the .devcontainer/devcontainer.json match the .devcontainer/extensions.txt file
 */

import { $ } from "zx"

import { cdAtRoot, cwdAtRoot } from "@/utils"
import { task } from "@rharkor/task"

import "zx/globals"

cwdAtRoot()
cdAtRoot()

const extensionsTask = await task.startTask({
  name: "Checking extensions file match... 📂",
})

const devcontainerFolder = ".devcontainer"

type TDevContainer = {
  customizations: { vscode: { extensions: string[] } }
}

const devcontainerPaths = await globby([`**/${devcontainerFolder}`], { onlyDirectories: true, dot: true })

if (devcontainerPaths.length === 0) {
  extensionsTask.error(`No devcontainers found`)
  extensionsTask.stop()
  process.exit(1)
}

for (const dirPath of devcontainerPaths) {
  extensionsTask.log(`Checking ${dirPath}`)
  const devcontainerJson = path.join(dirPath, "devcontainer.json")
  const extensionsTxt = path.join(dirPath, "extensions.txt")
  extensionsTask.log("Reading devcontainer.json")
  const devcontainerPlain = await $`cat ${devcontainerJson}`.text()
  const devcontainer: TDevContainer = JSON.parse(
    devcontainerPlain
      // Remove comments
      .replace(/\/\/.*/g, "")
  )

  extensionsTask.log("Reading extensions.txt")
  const extensions = (await $`cat ${extensionsTxt}`.text()).split("\n").filter(Boolean)

  const devcontainerExtensions = devcontainer["customizations"]["vscode"]["extensions"]

  if (
    extensions.length !== devcontainerExtensions.length ||
    extensions.some((ext) => !devcontainerExtensions.includes(ext))
  ) {
    extensionsTask.error(`Extensions in ${extensionsTxt} do not match the extensions in ${devcontainerJson}`)
    extensionsTask.stop()
    process.exit(1)
  }
}

extensionsTask.stop("Extensions match! 🎉")
