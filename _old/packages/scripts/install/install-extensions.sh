#!/bin/bash

echo "Installing vscode extensions... 🚀"

LIST=$(cat .devcontainer/extensions.txt)
COMMAND_ARGS=""
for EXTENSION in $LIST; do
  COMMAND_ARGS="$COMMAND_ARGS --install-extension $EXTENSION"
done
echo "Extensions: $COMMAND_ARGS"
code $COMMAND_ARGS
echo "Done! 🎉"
