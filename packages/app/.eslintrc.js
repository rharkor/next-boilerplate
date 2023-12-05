// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path")

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
    project: path.join(__dirname, "/tsconfig.json"),
  },
  plugins: ["@typescript-eslint", "unused-imports", "simple-import-sort"],
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
}
