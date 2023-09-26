#! /bin/sh
echo "Installing brew... 🚀"
sudo chown -R $(whoami) /home/linuxbrew/.linuxbrew
(echo; echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"') >> /home/$USER/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
brew install gcc

echo "Installing pre-commit... 🚀"
brew install pre-commit 
pre-commit install -t commit-msg