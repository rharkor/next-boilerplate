#!/bin/bash

# ZSH
echo "Installing ZSH... 🚀"
if [ -f "${ZDOTDIR:-$HOME}/.zshrc" ]; then
    cp ${ZDOTDIR:-$HOME}/.zshrc ${ZDOTDIR:-$HOME}/.zshrc.bak
fi
cp .devcontainer/.zshrc ${ZDOTDIR:-$HOME}/.zshrc

#? Install zsh syntax highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
echo "" >> ~/.zshrc
echo "source ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ${ZDOTDIR:-$HOME}/.zshrc

#? Install zsh autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

echo "Done! 🎉"
