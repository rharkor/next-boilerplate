/**
 * Install githooks
 */

import { $ } from "zx"

import { cwdAtRoot } from "@/utils"
import { logger, task } from "@rharkor/logger"

import "zx/globals"

export const installGitHooks = async () => {
  cwdAtRoot()
  await logger.init()

  const installGitHooksTask = await task.startTask({
    name: "Installing git hooks... 🪝",
  })

  //? Install git conventional commits
  installGitHooksTask?.print("Install git-conventional-commits")
  await $`npm install --global git-conventional-commits`

  //? Install git hooks
  installGitHooksTask?.print("Configure hooks path")
  await $`git config core.hooksPath .git-hooks`

  installGitHooksTask?.stop("Git hooks installed! 🎉")
}
