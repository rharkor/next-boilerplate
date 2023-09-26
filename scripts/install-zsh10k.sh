#! /bin/sh
# ZSH powerlevel10k
echo "Installing ZSH powerlevel10k... 🚀"
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
sed -i 's/ZSH_THEME=.*/ZSH_THEME="powerlevel10k\/powerlevel10k"/g' ${ZDOTDIR:-$HOME}/.zshrc
cp .devcontainer/.p10k.zsh ${ZDOTDIR:-$HOME}/.p10k.zsh
cp .devcontainer/.zshrc ${ZDOTDIR:-$HOME}/.zshrc
echo "" >> ~/.bashrc
echo "if [ -t 1 ]; then" >> ~/.bashrc
echo "exec zsh" >> ~/.bashrc
echo "fi" >> ~/.bashrc