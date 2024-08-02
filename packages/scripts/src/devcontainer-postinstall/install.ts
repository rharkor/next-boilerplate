#!/usr/bin/env zx

/**
 * Install zsh and git hooks
 */

import { installGitHooks } from "./install-git-hooks"
import { installZsh } from "./install-zsh"

import "zx/globals"

const inDevContainer = argv.devcontainer || false
const isPromptLimited = argv["prompt-limited"] || false

//* Install zsh only if the environment is devcontainer
if (inDevContainer) {
  await installZsh({ isPromptLimited })
}

await installGitHooks({ isPromptLimited })
