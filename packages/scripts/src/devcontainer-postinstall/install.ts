#!/usr/bin/env zx

/**
 * Install zsh and git hooks
 */

import "zx/globals";
import { logger } from "@rharkor/logger";
import { installZsh } from "./install-zsh";
import { installGitHooks } from "./install-git-hooks";

const inDevContainer = argv.devcontainer || false;

//* Install zsh only if the environment is devcontainer
if (inDevContainer) {
  await installZsh();
}

await installGitHooks();

logger.success("🎉 Installing done!");
