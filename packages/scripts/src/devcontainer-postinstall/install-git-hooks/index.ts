/**
 * Install githooks
 */

import "zx/globals";
import { $ } from "zx";
import { logger, task } from "@rharkor/logger";
import { cwdAtRoot } from "@/utils";

export const installGitHooks = async ({isPromptLimited}: {isPromptLimited: boolean}) => {
  cwdAtRoot();

  const installGitHooksTask = !isPromptLimited ? await task.startTask({
    name: "Installing git hooks... 🚀",
  }) : (() => {
    logger.info('Installing git hooks... 🚀')
  })();

  //? Install git conventional commits
  installGitHooksTask?.print("Install git-conventional-commits");
  await $`npm install --global git-conventional-commits`;

  //? Install git hooks
  installGitHooksTask?.print("Configure hooks path");
  await $`git config core.hooksPath .git-hooks`;

  installGitHooksTask?.stop("Git hooks installed! 🎉");
};
