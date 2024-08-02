/**
 * Install vscode extensions
 */

import { $ } from "zx"

import { cwdAtRoot } from "@/utils"
import { logger, task } from "@rharkor/logger"
import { chunk } from "@rharkor/utils"

import "zx/globals"

export const installExtensions = async () => {
  cwdAtRoot()
  await logger.init()

  const installExtensionsTask = await task.startTask({
    name: "Installing vscode extensions... 🚀",
  })

  installExtensionsTask.print("Parsing extensions.txt file")
  const extensions = (await $`cat .devcontainer/extensions.txt`.text()).split("\n").filter(Boolean)
  const chunkedExtensions = chunk(extensions, 5)

  const installExtensionsChunk = async (chunk: string[]) => {
    const commandArgs: string[] = []
    chunk.forEach((extension) => {
      commandArgs.push(`--install-extension=${extension}`)
    })

    await $`code ${commandArgs.join(" ")}`
  }

  const max = chunkedExtensions.reduce((acc, chunk) => acc + chunk.length, 0).toString()
  let number = 0
  const formatNumber = (number: number) => number.toString().padStart(max.length, " ")
  installExtensionsTask.print(`[${formatNumber(number)}/${max}] Install vscode extensions`)
  for (const chunk of chunkedExtensions) {
    await installExtensionsChunk(chunk)
    number += chunk.length
    installExtensionsTask.print(`[${formatNumber(number)}/${max}] Install vscode extensions`)
  }

  installExtensionsTask.stop("Vscode extensions installed! 🎉")
}
