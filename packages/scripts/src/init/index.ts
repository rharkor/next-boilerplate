#!/usr/bin/env zx

/**
 * Init the repository with the necessary configurations
 */

import { postInstall } from "@/postinstall/install"
import "zx/globals"
import { buildPackages } from "./build-packages"

//* Post install
// Setup git hooks
await postInstall()

//* Build packages
await buildPackages()
