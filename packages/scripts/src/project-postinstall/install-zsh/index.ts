/**
 * Install zsh
 */

import { $ } from "zx"

import { cwdAtRoot } from "@/utils"
import { logger } from "@rharkor/logger"
import { task } from "@rharkor/task"

import "zx/globals"

export const installZsh = async () => {
  cwdAtRoot()
  await logger.init()

  const customZshConfig = "packages/scripts/assets/.zshrc"

  const installZshTask = await task.startTask({
    name: "Installing ZSH... ⌨️",
    noClear: false,
  })

  //? Install zsh configuration
  const zshRcConfig = await $`echo \${ZDOTDIR:-$HOME}/.zshrc`
  const isZshRcConfigExists = await $`test -f ${zshRcConfig}`.then(() => true).catch(() => false)
  if (isZshRcConfigExists) {
    installZshTask?.log("Backup .zshrc file")
    await $`cp ${zshRcConfig} ${zshRcConfig}.bak`
  }
  installZshTask?.log("Copy .zshrc file")
  await $`cp ${customZshConfig} ${zshRcConfig}`

  //? Install zsh syntax highlighting
  const zshSyntaxHighlightingPath =
    await $`echo \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`
  const isZshSyntaxHighlightingPathExists = await $`test -d ${zshSyntaxHighlightingPath}`
    .then(() => true)
    .catch(() => false)
  if (isZshSyntaxHighlightingPathExists) {
    installZshTask?.log("zsh-syntax-highlighting already exists")
  } else {
    installZshTask?.log("Install zsh-syntax-highlighting")
    await $({
      quiet: true,
    })`git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${zshSyntaxHighlightingPath}`
  }

  //? Install zsh autosuggestions
  const zshAutosuggestionsPath = await $`echo \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`
  const isZshAutosuggestionsPathExists = await $`test -d ${zshAutosuggestionsPath}`.then(() => true).catch(() => false)
  if (isZshAutosuggestionsPathExists) {
    installZshTask?.log("zsh-autosuggestions already exists")
  } else {
    installZshTask?.log("Install zsh-autosuggestions")
    await $({
      quiet: true,
    })`git clone https://github.com/zsh-users/zsh-autosuggestions ${zshAutosuggestionsPath}`
  }

  installZshTask?.stop("ZSH installed! 🎉")
}
