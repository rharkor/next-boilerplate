// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require("path")

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    project: join(__dirname, "/tsconfig.json"),
  },
  extends: ["custom/base"],
  overrides: [
    {
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
      files: [
        "**/.eslintrc.js",
        "**/.eslintrc.cjs",
        "**/postcss.config.js",
        "**/tailwind.config.js",
        "**/prettier.config.js",
        "**/prettier.config.cjs",
        "**/dist/**",
      ],
    },
  ],
}
