echo "🚀 Installing ZSH powerlevel10k..."
./scripts/install/install-zsh10k.sh 1>/dev/null 2>&1
echo "🔥 Installing bun..."
./scripts/install/install-bun.sh 1>/dev/null 2>&1
echo "🛠️ Installing git hooks..."
./scripts/install/install-git-hooks.sh 1>/dev/null 2>&1
echo "📦 Installing dependencies..."
npm install 1>/dev/null 2>&1
echo "🎉 Installing done!"