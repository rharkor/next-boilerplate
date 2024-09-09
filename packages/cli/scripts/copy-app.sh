#! /bin/sh

# Exit on error
set -e

rm -rf dist/app
mkdir -p dist/app/.next
cp -r ../cli-app/public dist/app/public
cp -r ../cli-app/.next/standalone/packages/cli-app/* dist/app
cp -r ../cli-app/.next/standalone/packages/cli-app/.next dist/app
cp -r ../cli-app/.next/static dist/app/.next/static