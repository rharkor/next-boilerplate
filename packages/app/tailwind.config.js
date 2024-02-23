import * as path from "path"

import { nextui } from "@nextui-org/react"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ...["pages/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"].map((p) =>
      path.join(__dirname, p)
    ),
    path.join(__dirname, "../..", "node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            muted: "#f4f4f5",
            "muted-foreground": "#71717a",
          },
        },
        dark: {
          colors: {
            muted: "#27272a",
            "muted-foreground": "#a1a1aa",
          },
        },
      },
    }),
  ],
}
