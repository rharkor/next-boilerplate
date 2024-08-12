/**
 * Install githooks
 */

import { $ } from "zx"

import { cwdAtRoot } from "@/utils"
import { logger } from "@rharkor/logger"
import { task } from "@rharkor/task"

import "zx/globals"

export const installGitHooks = async () => {
  cwdAtRoot()
  await logger.init()

  const installGitHooksTask = await task.startTask({
    name: "Installing git hooks... 🪝",
  })

  //? Install git conventional commits
  installGitHooksTask?.log("Install git-conventional-commits")
  await $`npm install --global git-conventional-commits`

  //? Install git hooks
  installGitHooksTask?.log("Configure hooks path")
  await $`git config core.hooksPath .git-hooks`

  installGitHooksTask?.stop("Git hooks installed! 🎉")
}
