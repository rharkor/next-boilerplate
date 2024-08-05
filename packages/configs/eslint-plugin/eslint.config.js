/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-check

import prettier from "eslint-config-prettier"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import tseslint from "typescript-eslint"

import eslint from "@eslint/js"

// Cannot use base config from @next-boilerplate/eslint because it will cause circular dependency
export default tseslint.config(
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "**/.eslintrc.js",
      "**/.eslintrc.cjs",
      "**/postcss.config.js",
      "**/tailwind.config.js",
      "**/prettier.config.js",
      "**/prettier.config.cjs",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // @ts-ignore
  prettier,
  {
    plugins: { "unused-imports": unusedImports, "simple-import-sort": simpleImportSort },
    languageOptions: {
      parserOptions: {
        extraFileExtensions: [".json"],
      },
    },
    rules: {
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
