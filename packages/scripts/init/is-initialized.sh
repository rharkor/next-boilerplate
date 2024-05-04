#!/bin/bash

# Define the root path relative to this script's location
ROOT_PATH="$(dirname "$0")"

# Load environment variables from a .env file
if [ -f "$ROOT_PATH/.env" ]; then
    set -a
    . "$ROOT_PATH/.env"
    set +a
fi


# Check if SKIP_INIT_CHECK environment variable is set to "true"
if [ "$SKIP_INIT_CHECK" = "true" ]; then
    exit 0
fi

# Check for the existence of the "scripts/.init-todo" file
if [ -f "$ROOT_PATH/.init-todo" ]; then
    # Using tput for colors
    RED=$(tput setaf 1)
    YELLOW=$(tput setaf 3)
    RESET=$(tput sgr0)

    echo "${RED}Project not initialized!"
    echo "${YELLOW}Run \`npm run init\` to initialize the project${RESET}"
    exit 1
fi
