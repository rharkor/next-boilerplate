#!/usr/bin/env zx

/**
 * Init the repository with the necessary configurations
 */

import { postInstall } from "@/project-postinstall/install"

import { buildPackages } from "./build-packages"

import "zx/globals"

//* Post install
// Setup git hooks
await postInstall()

//* Build packages
await buildPackages()
