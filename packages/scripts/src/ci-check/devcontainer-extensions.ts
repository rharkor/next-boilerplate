#!/usr/bin/env zx

/**
 * Ensure that the exentions specified in the .devcontainer/devcontainer.json match the .devcontainer/extensions.txt file
 */

import "zx/globals";
import { $ } from "zx";
import { cwdAtRoot } from "@/utils";

cwdAtRoot();

const devcontainerJson = ".devcontainer/devcontainer.json";
const extensionsTxt = ".devcontainer/extensions.txt";

type TDevContainer = {
  customizations: { vscode: { extensions: string[] } };
};

const devcontainerPlain = await $`cat ${devcontainerJson}`.text();
const devcontainer: TDevContainer = JSON.parse(
  devcontainerPlain
    // Remove comments
    .replace(/\/\/.*/g, "")
);
const extensions = (await $`cat ${extensionsTxt}`.text())
  .split("\n")
  .filter(Boolean);

const devcontainerExtensions =
  devcontainer["customizations"]["vscode"]["extensions"];

if (
  extensions.length !== devcontainerExtensions.length ||
  extensions.some((ext) => !devcontainerExtensions.includes(ext))
) {
  console.error(
    `Extensions in ${extensionsTxt} do not match the extensions in ${devcontainerJson}`
  );
  process.exit(1);
}
