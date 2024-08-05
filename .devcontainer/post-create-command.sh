#!/bin/sh
set -e

echo "🔓 Changing node_modules permissions"
sudo chown node node_modules

echo "📦 Installing dependencies"
npm i -s

echo "🔨 Building initial script"
npm run build -w packages/scripts -s

echo "🏃 Running initial script"
npm run project-postinstall -s -w packages/scripts -- --devcontainer