import { ESLint } from "eslint";
import { rule as noNodeModulesImport } from "./no-node-modules-import";

export const rules: ESLint.Plugin["rules"] = {
  "no-node-modules-import": noNodeModulesImport,
};
