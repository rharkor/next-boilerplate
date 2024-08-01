/**
 * Install zsh
 */

import "zx/globals";
import { $ } from "zx";
import { task } from "@rharkor/logger";
import { cwdAtRoot } from "@/utils";

export const installZsh = async () => {
  cwdAtRoot();
  const customZshConfig = "packages/scripts/assets/.zshrc";

  const installZshTask = await task.startTask({
    name: "Installing ZSH... 🚀",
  });

  //? Install zsh configuration
  const zshRcConfig = await $`echo \${ZDOTDIR:-$HOME}/.zshrc`;
  const isZshRcConfigExists = await $`test -f ${zshRcConfig}`
    .then(() => true)
    .catch(() => false);
  if (isZshRcConfigExists) {
    installZshTask.print("Backup .zshrc file");
    await $`cp ${zshRcConfig} ${zshRcConfig}.bak`;
  }
  installZshTask.print("Copy .zshrc file");
  await $`cp ${customZshConfig} ${zshRcConfig}`;

  //? Install zsh syntax highlighting
  const zshSyntaxHighlightingPath =
    await $`echo \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`;
  const isZshSyntaxHighlightingPathExists =
    await $`test -d ${zshSyntaxHighlightingPath}`
      .then(() => true)
      .catch(() => false);
  if (isZshSyntaxHighlightingPathExists) {
    installZshTask.print("zsh-syntax-highlighting already exists");
  } else {
    installZshTask.print("Install zsh-syntax-highlighting");
    await $`git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${zshSyntaxHighlightingPath}`;
  }

  //? Install zsh autosuggestions
  const zshAutosuggestionsPath =
    await $`echo \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`;
  const isZshAutosuggestionsPathExists =
    await $`test -d ${zshAutosuggestionsPath}`
      .then(() => true)
      .catch(() => false);
  if (isZshAutosuggestionsPathExists) {
    installZshTask.print("zsh-autosuggestions already exists");
  } else {
    installZshTask.print("Install zsh-autosuggestions");
    await $`git clone https://github.com/zsh-users/zsh-autosuggestions ${zshAutosuggestionsPath}`;
  }

  installZshTask.stop("ZSH installed! 🎉");
};
