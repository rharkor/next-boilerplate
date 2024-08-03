#!/usr/bin/env zx

/**
 * Build all packages
 */

import { cwdAtRoot } from "@/utils"
import { task } from "@rharkor/logger"
import "zx/globals"

export const buildPackages = async () => {
  cwdAtRoot()

  const buildPackagesTask = await task.startTask({
    name: "Building packages... 📦",
    noClear: false,
  })

  //* Build packages (in packages directory)
  //? Use turbo mode to build all packages in parallel
  await $`turbo run build --filter=./packages/* --output-logs=errors-only`

  buildPackagesTask.stop("Packages built successfully! 🚀")
}
