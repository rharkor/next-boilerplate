import type { Linter } from "eslint"

const config: Linter.Config = {
  extends: [
    "next/core-web-vitals",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:tailwindcss/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports", "simple-import-sort", "@next-boilerplate"],
  parserOptions: {
    extraFileExtensions: [".json"],
  },
  rules: {
    "unused-imports/no-unused-imports": "error",
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "max-params": ["error", 4],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/classnames-order": "off",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-process-env": "error",
    "@next-boilerplate/no-node-modules-import": "error",
    "@next-boilerplate/no-use-client": "error",
    "@next-boilerplate/handle-api-error": "error",
  },
  overrides: [
    {
      files: ["**/*.js", "**/*.ts", "**/*.tsx"],
      rules: {
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
      },
    },
  ],
  ignorePatterns: [
    "node_modules",
    "dist",
    "build",
    ".next",
    "**/.eslintrc.js",
    "**/.eslintrc.cjs",
    "**/postcss.config.js",
    "**/tailwind.config.js",
    "**/prettier.config.js",
    "**/prettier.config.cjs",
  ],
}

export default config
