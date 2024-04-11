/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
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
      ],
    },
  ],
}
