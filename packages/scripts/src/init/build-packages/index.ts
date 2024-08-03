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
  //? Use turbo mode to build all packages imported in the project
  await $({ quiet: true })`turbo run build --filter='@next-boilerplate/*'^...`

  buildPackagesTask.stop("Packages built successfully! 🎉")
}
