#!/bin/sh
set -e

sudo chown node node_modules
npm i
npm run build -w packages/scripts
npm run devcontainer-postinstall -w packages/scripts -- --devcontainer --prompt-limited