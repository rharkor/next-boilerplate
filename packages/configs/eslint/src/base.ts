/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ignores } from "./utils/ignores"
import prettier from "eslint-config-prettier"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import tseslint from "typescript-eslint"
import eslint from "@eslint/js"
import customRules from "@next-boilerplate/eslint-plugin"

const config = tseslint.config(
  {
    ignores,
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // @ts-ignore
  prettier,
  {
    plugins: { "unused-imports": unusedImports, "simple-import-sort": simpleImportSort, "custom-rules": customRules },
    languageOptions: {
      parserOptions: {
        extraFileExtensions: [".json"],
      },
    },
    rules: {
      "custom-rules/no-node-modules-import": "error",
      "unused-imports/no-unused-imports": "error",
      "max-params": ["error", 4],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // `react` first, `next` second
            ["^react$", "^next"],
            // Packages starting with a character
            ["^[a-z]"],
            // Packages starting with `@`
            ["^@"],
            // Packages starting with `~`
            ["^~"],
            // Imports starting with `../`
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Imports starting with `./`
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Style imports
            ["^.+\\.s?css$"],
            // Side effect imports
            ["^\\u0000"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-process-env": "error",
    },
  }
)

export default config
