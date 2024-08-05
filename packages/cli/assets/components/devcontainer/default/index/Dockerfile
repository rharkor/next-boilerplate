FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends git zsh nano vim gnupg software-properties-common

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# Install more global node modules
RUN su node -c "npm install -g npm@latest"
RUN su node -c "npm install -g turbo"