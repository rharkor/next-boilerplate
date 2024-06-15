import next from "eslint-config-next"
import prettier from "eslint-config-prettier"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import globals from "globals"
import tseslint from "typescript-eslint"

import pluginJs from "@eslint/js"
import customPlugin from "@smart-dev/custom-eslint-plugin"
import type { TSESLint } from "@typescript-eslint/utils"

import { ignores } from "./utils/ignores"
console.log("🚀 ~ next:", next)

const config: TSESLint.FlatConfig.ConfigArray = [
  {
    ignores,
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  next,
  prettier,
  {
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
      "custom-eslint-plugin": customPlugin,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "max-params": ["error", 4],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // `react` first, `next` second, then packages starting with a character
            ["^react$", "^next", "^[a-z]"],
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
      "custom-eslint-plugin/no-node-modules-import": "error",
      "custom-eslint-plugin/no-use-client": "error",
      "custom-eslint-plugin/handle-api-error": "error",
      "tailwindcss/no-custom-classname": "off",
    },
    ignores,
  },
]

export default config
