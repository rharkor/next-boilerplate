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

APPS="app cron docs landing"

NEEDS_PACKAGE_JSON=false

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
        NEEDS_PACKAGE_JSON=true
        ;;
    "cron")
        FOLDERS+="apps/cron packages"
        NEEDS_PACKAGE_JSON=true
        ;;
    "docs")
        FOLDERS+="apps/docs packages"
        NEEDS_PACKAGE_JSON=true
        ;;
    "landing")
        FOLDERS+=" apps/landing packages"
        NEEDS_PACKAGE_JSON=true
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

if [ "$NEEDS_PACKAGE_JSON" = true ]; then
    echo "Add all package.json files"
    for APP in $APPS; do
        echo "/apps/$APP/" >>.git/info/sparse-checkout
        echo "!/apps/$APP/*/" >>.git/info/sparse-checkout
    done

    echo "Running 'git sparse-checkout reapply'"
    git sparse-checkout reapply
fi
