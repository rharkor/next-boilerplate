#!/bin/bash -e

SCRIPTNAME=$0

die() {
    echo "$SCRIPTNAME: $1"
    exit 1
}

# Check if at least one team is specified
if [ $# -eq 0 ]; then
    die "please specify at least one valid team"
fi

FOLDERS=""

# Loop through all arguments
for TEAM in "$@"; do
    case $TEAM in
    "full")
        echo "Running 'git sparse-checkout disable'"
        git sparse-checkout disable
        exit 0
        ;;
    "app")
        FOLDERS+="apps/app packages"
        ;;
    "cron")
        FOLDERS+="apps/cron packages"
        ;;
    "docs")
        FOLDERS+="apps/docs packages"
        ;;
    "landing")
        FOLDERS+=" apps/landing packages"
        ;;
    "infra")
        FOLDERS+="infra"
        ;;
    *)
        die "Invalid team specified: $TEAM"
        ;;
    esac
done

BASE_FOLDERS=".devcontainer .github .git-hooks .vscode docker"

echo "Running 'git sparse-checkout set $BASE_FOLDERS $FOLDERS'"
git sparse-checkout set $BASE_FOLDERS $FOLDERS

# Non cone files
EXTEND_BASE="'**/package.json'"

echo "Running 'git sparse-checkout add $EXTEND_BASE'"
git sparse-checkout add $EXTEND_BASE
