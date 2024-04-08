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
for TEAM in "$@"
do
    case $TEAM in
    "full")
        FOLDERS+=" *"
        ;;
    "app")
        FOLDERS+=" apps/app packages"
        ;;
    "cron")
        FOLDERS+=" apps/cron packages"
        ;;
    "docs")
        FOLDERS+=" apps/docs packages"
        ;;
    "landing")
        FOLDERS+=" apps/landing packages"
        ;;
    "infra")
        FOLDERS+=" infra"
        ;;
    *)
        die "Invalid team specified: $TEAM"
        ;;
    esac
done

echo "Running 'git sparse-checkout init --cone'"
git sparse-checkout init --cone

# Remove leading space
FOLDERS=${FOLDERS# }

echo "Running 'git sparse-checkout set $FOLDERS'"
git sparse-checkout set $FOLDERS
