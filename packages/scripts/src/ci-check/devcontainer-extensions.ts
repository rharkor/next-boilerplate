#!/usr/bin/env zx

/**
 * Ensure that the exentions specified in the .devcontainer/devcontainer.json match the .devcontainer/extensions.txt file
 */

import { $ } from "zx"

import { cwdAtRoot } from "@/utils"
import { task } from "@rharkor/logger"

import "zx/globals"

cwdAtRoot()

const extensionsTask = await task.startTask({
  name: "Checking extensions file match... 📂",
})

const devcontainerJson = ".devcontainer/devcontainer.json"
const extensionsTxt = ".devcontainer/extensions.txt"

type TDevContainer = {
  customizations: { vscode: { extensions: string[] } }
}

extensionsTask.print("Reading devcontainer.json")
const devcontainerPlain = await $`cat ${devcontainerJson}`.text()
const devcontainer: TDevContainer = JSON.parse(
  devcontainerPlain
    // Remove comments
    .replace(/\/\/.*/g, "")
)

extensionsTask.print("Reading extensions.txt")
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

extensionsTask.stop("Extensions match! 🎉")
