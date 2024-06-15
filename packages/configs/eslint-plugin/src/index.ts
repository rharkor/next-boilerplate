import fs from "fs";
import { rules } from "./rules";
import { ESLint } from "eslint";
const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

const config: ESLint.Plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  rules,
};

export default config;
