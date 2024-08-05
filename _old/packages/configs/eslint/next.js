/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "next",
    "prettier",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended",
    "plugin:tailwindcss/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    babelOptions: {
      presets: [require.resolve("next/babel")],
    },
    extraFileExtensions: [".json"],
  },
  plugins: ["@typescript-eslint", "unused-imports", "simple-import-sort", "custom-rule"],
  rules: {
    "testing-library/prefer-screen-queries": "off",
    "@next/next/no-html-link-for-pages": "off",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "tailwindcss/classnames-order": "off",
    "max-params": ["error", 4],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "tailwindcss/no-custom-classname": "off",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "custom-rule/no-use-client": "error",
    "no-process-env": "error",
    "custom-rule/no-node-modules-import": "error",
    "custom-rule/handle-api-error": "error",
  },
  overrides: [
    {
      files: ["**/*.js", "**/*.ts", "**/*.tsx"],
      rules: {
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
      },
    },
  ],
  ignorePatterns: [
    "node_modules",
    ".next",
    "dist",
    "**/.eslintrc.js",
    "**/.eslintrc.cjs",
    "**/postcss.config.js",
    "**/tailwind.config.js",
    "**/prettier.config.js",
    "**/prettier.config.cjs",
  ],
}
