#!/bin/bash

#* Search for banned keywords in the source code. And exit with an error if any

# List of keywords to check for
keywords=("TODO")

# Directory to search for source code
source_code_dir="../"

# Exclude node_modules and .next directories
exclude_dir="--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude=.p10k.zsh --exclude=banned-keywords.sh"


echo Start searching..
# Iterate through the keywords
for keyword in "${keywords[@]}"; do
    echo Searching for $keyword
    # Use grep to search for the keyword in source code files
    grep_result=$(grep -r "$keyword" "$(pwd)" $exclude_dir)

    # Check if grep found any matches
    if [ -n "$grep_result" ]; then
        echo "Keyword '$keyword' found. Exiting."
        echo $grep_result
        exit 1
    fi
done

echo "No keywords found in source code."
exit 0
