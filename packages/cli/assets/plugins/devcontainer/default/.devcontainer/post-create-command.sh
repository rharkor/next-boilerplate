#!/bin/sh
set -e

echo "🔓 Changing node_modules permissions"
sudo chown node node_modules

echo "📦 Installing dependencies"
npm i -s