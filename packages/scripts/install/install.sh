base_dir=$(pwd)/packages
echo "🚀 Installing ZSH ..."
$base_dir/scripts/install/install-zsh.sh 1>/dev/null 2>&1
echo "🔨 Installing git hooks..."
$base_dir/scripts/install/install-git-hooks.sh 1>/dev/null 2>&1
echo "📦 Installing dependencies..."
npm install 1>/dev/null 2>&1
echo "🎉 Installing done!"