/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["prettier", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint", "unused-imports", "simple-import-sort", "custom-rule"],
  parserOptions: {
    extraFileExtensions: [".json"],
  },
  rules: {
    "unused-imports/no-unused-imports": "error",
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
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-process-env": "error",
    "custom-rule/no-node-modules-import": "error",
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
