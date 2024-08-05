#!/usr/bin/env zx

/**
 * Install zsh and git hooks
 */

import { installGitHooks } from "./install-git-hooks"
import { installZsh } from "./install-zsh"

import "zx/globals"

export const postInstall = async () => {
  const inDevContainer = argv.devcontainer || false

  //* Install zsh only if the environment is devcontainer
  if (inDevContainer) {
    await installZsh()
  }

  await installGitHooks()
}
