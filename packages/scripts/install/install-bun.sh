echo "Installing bun... 🚀"
curl -fsSL https://bun.sh/install | bash

echo "# bun" >> ~/.zshrc
echo "export BUN_INSTALL=\"\$HOME/.bun\"" >> ~/.zshrc
echo "export PATH=\$BUN_INSTALL/bin:\$PATH" >> ~/.zshrc

echo "Done! 🎉"
