#!/bin/bash

base_dir=$(pwd)/packages

ENV=$1

# Install zsh only if the environment is devcontainer
if [ "$ENV" = "devcontainer" ]; then
  echo "🚀 Installing ZSH ..."
  $base_dir/scripts/install/install-zsh.sh 1>/dev/null 2>&1
fi

echo "🔨 Installing git hooks..."
$base_dir/scripts/install/install-git-hooks.sh 1>/dev/null 2>&1

echo "🎉 Installing done!"
